import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { ImageItem, VideoConfig, RenderProgress } from '../types';

/**
 * Loads HTMLImageElement instances if not already loaded
 */
export async function preloadImages(images: ImageItem[]): Promise<HTMLImageElement[]> {
  const loadedPromises = images.map((item) => {
    if (item.element && item.element.complete && item.element.naturalWidth > 0) {
      return Promise.resolve(item.element);
    }
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        item.element = img;
        item.width = img.naturalWidth;
        item.height = img.naturalHeight;
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error(`Gagal memuat gambar: ${item.name}`));
      };
      img.src = item.url;
    });
  });
  return Promise.all(loadedPromises);
}

/**
 * Draws a single frame onto a canvas 2D context based on time in seconds.
 */
export function renderFrameAtTime(
  ctx: CanvasRenderingContext2D,
  timeSec: number,
  images: ImageItem[],
  config: VideoConfig
) {
  const { width, height, durationSeconds, transition, transitionDuration, fitMode, overlayText, overlayPosition } = config;
  const numImages = images.length;
  if (numImages === 0) {
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);
    return;
  }

  // Clear background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Calculate slide duration
  const slideDuration = durationSeconds / numImages;
  const currentSlideIndex = Math.min(Math.floor(timeSec / slideDuration), numImages - 1);
  const slideTime = timeSec - currentSlideIndex * slideDuration;
  const nextSlideIndex = (currentSlideIndex + 1) % numImages;

  const currentItem = images[currentSlideIndex];
  const nextItem = images[nextSlideIndex];

  const currentImg = currentItem?.element;
  const nextImg = nextItem?.element;

  // Check if we are in transition zone
  const transTime = Math.min(transitionDuration, slideDuration * 0.4);
  const isTransitioning = currentSlideIndex < numImages - 1 && slideTime >= (slideDuration - transTime);
  const transProgress = isTransitioning ? (slideTime - (slideDuration - transTime)) / transTime : 0;

  // Helper to draw single image with Ken Burns or static fit
  const drawImageOnCtx = (
    img: HTMLImageElement | undefined,
    alpha: number = 1.0,
    zoomFactor: number = 1.0,
    panX: number = 0,
    panY: number = 0,
    offsetX: number = 0,
    offsetY: number = 0
  ) => {
    if (!img || !img.naturalWidth) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = width / height;

    let targetW = width;
    let targetH = height;

    if (fitMode === 'cover') {
      if (imgAspect > canvasAspect) {
        targetH = height;
        targetW = height * imgAspect;
      } else {
        targetW = width;
        targetH = width / imgAspect;
      }
    } else {
      // contain
      if (imgAspect > canvasAspect) {
        targetW = width;
        targetH = width / imgAspect;
      } else {
        targetH = height;
        targetW = height * imgAspect;
      }
    }

    // Apply zoom and pan
    targetW *= zoomFactor;
    targetH *= zoomFactor;

    const centerX = width / 2 + offsetX + panX;
    const centerY = height / 2 + offsetY + panY;

    ctx.drawImage(img, centerX - targetW / 2, centerY - targetH / 2, targetW, targetH);
    ctx.restore();
  };

  // Ken Burns calculation for current slide
  const slideProgress = slideTime / slideDuration; // 0 to 1
  const isEven = currentSlideIndex % 2 === 0;
  
  let kbZoom = 1.0;
  let kbPanX = 0;
  let kbPanY = 0;

  if (transition === 'kenburns') {
    // Alternate zoom in and zoom out
    if (isEven) {
      kbZoom = 1.0 + slideProgress * 0.12;
      kbPanX = (slideProgress - 0.5) * width * 0.05;
      kbPanY = (slideProgress - 0.5) * height * 0.03;
    } else {
      kbZoom = 1.12 - slideProgress * 0.12;
      kbPanX = (0.5 - slideProgress) * width * 0.04;
      kbPanY = (0.5 - slideProgress) * height * 0.04;
    }
  }

  // Draw images based on transition mode
  if (!isTransitioning || transition === 'cut') {
    drawImageOnCtx(currentImg, 1.0, kbZoom, kbPanX, kbPanY);
  } else {
    // Easing function for smooth transition
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const smoothT = ease(transProgress);

    switch (transition) {
      case 'kenburns':
      case 'crossfade': {
        // Crossfade with Ken Burns on both
        drawImageOnCtx(currentImg, 1.0 - smoothT, kbZoom, kbPanX, kbPanY);
        // Next image starts at 1.05 zoom
        drawImageOnCtx(nextImg, smoothT, 1.05, 0, 0);
        break;
      }
      case 'slide': {
        // Horizontal slide
        drawImageOnCtx(currentImg, 1.0, 1.0, 0, 0, -smoothT * width, 0);
        drawImageOnCtx(nextImg, 1.0, 1.0, 0, 0, (1.0 - smoothT) * width, 0);
        break;
      }
      case 'zoom': {
        // Zoom transition
        const scaleCurrent = 1.0 + smoothT * 0.25;
        const scaleNext = 0.85 + smoothT * 0.15;
        drawImageOnCtx(currentImg, 1.0 - smoothT, scaleCurrent);
        drawImageOnCtx(nextImg, smoothT, scaleNext);
        break;
      }
      case 'fade_black': {
        // Fade to black then fade in next
        if (transProgress < 0.5) {
          const fadeOut = 1.0 - (transProgress * 2);
          drawImageOnCtx(currentImg, fadeOut, 1.0);
        } else {
          const fadeIn = (transProgress - 0.5) * 2;
          drawImageOnCtx(nextImg, fadeIn, 1.0);
        }
        break;
      }
      default:
        drawImageOnCtx(currentImg, 1.0, kbZoom, kbPanX, kbPanY);
        break;
    }
  }

  // Draw overlay text / watermark if configured
  if (overlayText && overlayText.trim().length > 0) {
    ctx.save();
    const fontSize = Math.max(16, Math.round(height * 0.038));
    ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = Math.round(fontSize * 0.4);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    const padding = Math.round(fontSize * 1.2);

    if (overlayPosition === 'bottom') {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(overlayText, width / 2, height - padding);
    } else if (overlayPosition === 'top') {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(overlayText, width / 2, padding);
    } else if (overlayPosition === 'center') {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(overlayText, width / 2, height / 2);
    } else if (overlayPosition === 'watermark') {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.globalAlpha = 0.65;
      const wmSize = Math.max(13, Math.round(fontSize * 0.7));
      ctx.font = `500 ${wmSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
      ctx.fillText(overlayText, width - padding, height - padding);
    }
    ctx.restore();
  }
}

/**
 * Checks if WebCodecs VideoEncoder is available in the current browser.
 */
export function isWebCodecsSupported(): boolean {
  return typeof window !== 'undefined' && 'VideoEncoder' in window && 'VideoFrame' in window;
}

/**
 * Main export function: encodes frames to standard MP4 completely offline in browser.
 */
export async function exportVideoToMp4(
  images: ImageItem[],
  config: VideoConfig,
  onProgress: (progress: RenderProgress) => void,
  abortSignal?: AbortSignal
): Promise<{ blob: Blob; url: string; sizeMb: number }> {
  // 1. Ensure images are loaded
  await preloadImages(images);

  const { width, height, fps, durationSeconds } = config;
  const totalFrames = Math.round(durationSeconds * fps);

  // Create canvas for rendering
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context tidak didukung.');
  }

  const startTimeMs = performance.now();

  // Try WebCodecs + mp4-muxer first for true .mp4 output
  if (isWebCodecsSupported()) {
    try {
      return await exportWithWebCodecs(canvas, ctx, images, config, totalFrames, startTimeMs, onProgress, abortSignal);
    } catch (err) {
      console.warn('WebCodecs encoding encountered error, falling back to MediaRecorder:', err);
      // Fallback to MediaRecorder below
    }
  }

  // Fallback to MediaRecorder
  return await exportWithMediaRecorder(canvas, ctx, images, config, totalFrames, startTimeMs, onProgress, abortSignal);
}

/**
 * High-speed native WebCodecs + mp4-muxer export
 */
async function exportWithWebCodecs(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  images: ImageItem[],
  config: VideoConfig,
  totalFrames: number,
  startTimeMs: number,
  onProgress: (progress: RenderProgress) => void,
  abortSignal?: AbortSignal
): Promise<{ blob: Blob; url: string; sizeMb: number }> {
  const { width, height, fps, durationSeconds } = config;

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: {
      codec: 'avc',
      width,
      height,
    },
    fastStart: 'in-memory',
  });

  let encoderError: Error | null = null;
  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta);
    },
    error: (e) => {
      encoderError = e;
    },
  });

  // Configure AVC/H.264 encoder
  // avc1.42001f = Baseline Profile 3.1, widely compatible across all devices
  // Calculate bitrate proportional to resolution and fps
  const bitrate = Math.min(10_000_000, Math.max(2_500_000, width * height * fps * 0.15));

  await videoEncoder.configure({
    codec: 'avc1.42001f',
    width,
    height,
    bitrate,
    framerate: fps,
  });

  const frameDurationUs = (1_000_000 / fps);

  for (let f = 0; f < totalFrames; f++) {
    if (abortSignal?.aborted) {
      videoEncoder.close();
      throw new Error('Export dibatalkan oleh pengguna.');
    }
    if (encoderError) {
      throw encoderError;
    }

    const currentTimeSec = (f / totalFrames) * durationSeconds;
    renderFrameAtTime(ctx, currentTimeSec, images, config);

    // Create VideoFrame from canvas
    const timestampUs = Math.round(f * frameDurationUs);
    const videoFrame = new VideoFrame(canvas, {
      timestamp: timestampUs,
      duration: Math.round(frameDurationUs),
    });

    const isKeyFrame = f % (fps * 2) === 0;
    videoEncoder.encode(videoFrame, { keyFrame: isKeyFrame });
    videoFrame.close();

    // Throttle encoder queue to avoid memory buildup
    if (videoEncoder.encodeQueueSize > 5) {
      await new Promise((r) => setTimeout(r, 10));
    }

    // Progress updates
    const elapsed = (performance.now() - startTimeMs) / 1000;
    const currentFps = f > 0 ? (f / elapsed) : fps;
    const remainingFrames = totalFrames - f;
    const etaSec = currentFps > 0 ? Math.round(remainingFrames / currentFps) : 0;
    const percent = Math.min(99, Math.round(((f + 1) / totalFrames) * 100));

    onProgress({
      status: 'rendering',
      currentFrame: f + 1,
      totalFrames,
      percent,
      fps: Math.round(currentFps),
      etaSeconds: etaSec,
    });

    // Small yield every 4 frames so UI remains responsive
    if (f % 4 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  onProgress({
    status: 'muxing',
    currentFrame: totalFrames,
    totalFrames,
    percent: 99,
    fps: 0,
    etaSeconds: 1,
  });

  await videoEncoder.flush();
  videoEncoder.close();
  muxer.finalize();

  const buffer = target.buffer;
  const blob = new Blob([buffer], { type: 'video/mp4' });
  const url = URL.createObjectURL(blob);
  const sizeMb = Number((blob.size / (1024 * 1024)).toFixed(2));

  onProgress({
    status: 'completed',
    currentFrame: totalFrames,
    totalFrames,
    percent: 100,
    fps: 0,
    etaSeconds: 0,
    outputBlobUrl: url,
    fileSizeMb: sizeMb,
  });

  return { blob, url, sizeMb };
}

/**
 * MediaRecorder fallback export (compatible with all modern browsers)
 */
async function exportWithMediaRecorder(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  images: ImageItem[],
  config: VideoConfig,
  totalFrames: number,
  startTimeMs: number,
  onProgress: (progress: RenderProgress) => void,
  abortSignal?: AbortSignal
): Promise<{ blob: Blob; url: string; sizeMb: number }> {
  const { fps, durationSeconds } = config;

  // Determine supported mime type
  let mimeType = 'video/mp4';
  if (!MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
  }

  const stream = canvas.captureStream(fps);
  const chunks: Blob[] = [];

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8_000_000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  recorder.start();

  const frameIntervalMs = 1000 / fps;

  for (let f = 0; f < totalFrames; f++) {
    if (abortSignal?.aborted) {
      recorder.stop();
      throw new Error('Export dibatalkan oleh pengguna.');
    }

    const currentTimeSec = (f / totalFrames) * durationSeconds;
    renderFrameAtTime(ctx, currentTimeSec, images, config);

    // Progress updates
    const elapsed = (performance.now() - startTimeMs) / 1000;
    const currentFps = f > 0 ? (f / elapsed) : fps;
    const remainingFrames = totalFrames - f;
    const etaSec = currentFps > 0 ? Math.round(remainingFrames / currentFps) : 0;
    const percent = Math.min(99, Math.round(((f + 1) / totalFrames) * 100));

    onProgress({
      status: 'rendering',
      currentFrame: f + 1,
      totalFrames,
      percent,
      fps: Math.round(currentFps),
      etaSeconds: etaSec,
    });

    await new Promise((r) => setTimeout(r, frameIntervalMs * 0.8));
  }

  onProgress({
    status: 'muxing',
    currentFrame: totalFrames,
    totalFrames,
    percent: 99,
    fps: 0,
    etaSeconds: 1,
  });

  const completionPromise = new Promise<{ blob: Blob; url: string; sizeMb: number }>((resolve) => {
    recorder.onstop = () => {
      const finalBlob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(finalBlob);
      const sizeMb = Number((finalBlob.size / (1024 * 1024)).toFixed(2));
      resolve({ blob: finalBlob, url, sizeMb });
    };
  });

  recorder.stop();
  const result = await completionPromise;

  onProgress({
    status: 'completed',
    currentFrame: totalFrames,
    totalFrames,
    percent: 100,
    fps: 0,
    etaSeconds: 0,
    outputBlobUrl: result.url,
    fileSizeMb: result.sizeMb,
  });

  return result;
}
