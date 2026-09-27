import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ImageItem, VideoConfig } from '../types';
import { renderFrameAtTime, preloadImages } from '../utils/videoRenderer';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface VideoPlayerProps {
  images: ImageItem[];
  config: VideoConfig;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ images, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isImagesLoaded, setIsImagesLoaded] = useState<boolean>(false);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  // Preload images whenever images change
  useEffect(() => {
    let isCancelled = false;
    if (images.length > 0) {
      preloadImages(images)
        .then(() => {
          if (!isCancelled) {
            setIsImagesLoaded(true);
            drawFrame(currentTime);
          }
        })
        .catch((err) => console.error('Error preloading preview images:', err));
    } else {
      setIsImagesLoaded(true);
      drawFrame(0);
    }

    return () => {
      isCancelled = true;
    };
  }, [images]);

  // Frame drawing function
  const drawFrame = useCallback(
    (timeSec: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      renderFrameAtTime(ctx, timeSec, images, config);
    },
    [images, config]
  );

  // Re-draw when config or time changes while not playing
  useEffect(() => {
    if (!isPlaying) {
      drawFrame(currentTime);
    }
  }, [currentTime, config, isPlaying, drawFrame]);

  // Clamp current time if duration shrinks
  useEffect(() => {
    if (currentTime > config.durationSeconds) {
      setCurrentTime(config.durationSeconds);
    }
  }, [config.durationSeconds, currentTime]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimestampRef.current = null;
      return;
    }

    const loop = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const deltaSec = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      setCurrentTime((prevTime) => {
        const nextTime = prevTime + deltaSec;
        if (nextTime >= config.durationSeconds) {
          // Loop around smoothly
          drawFrame(0);
          return 0;
        } else {
          drawFrame(nextTime);
          return nextTime;
        }
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, config.durationSeconds, drawFrame]);

  const togglePlay = () => {
    if (images.length === 0) return;
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    drawFrame(0);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    drawFrame(newTime);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  // Determine container aspect ratio style
  const getAspectRatioClass = () => {
    switch (config.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[460px] mx-auto';
      case '1:1':
        return 'aspect-square max-h-[440px] mx-auto';
      case '4:5':
        return 'aspect-[4/5] max-h-[460px] mx-auto';
      case '16:9':
      default:
        return 'aspect-video w-full max-h-[420px]';
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
      {/* Player Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex items-center justify-center bg-black/95 overflow-hidden p-2 min-h-[300px]"
      >
        <div className={`relative ${getAspectRatioClass()} flex items-center justify-center`}>
          <canvas
            ref={canvasRef}
            width={config.width}
            height={config.height}
            onClick={togglePlay}
            className="w-full h-full object-contain rounded cursor-pointer shadow-2xl"
          />

          {/* Big Play Button Overlay when paused */}
          {!isPlaying && images.length > 0 && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-slate-900/70 hover:bg-indigo-600/90 text-white flex items-center justify-center backdrop-blur-sm border border-slate-700 hover:border-indigo-400 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
            >
              <Play className="w-6 h-6 ml-0.5 fill-current" />
            </button>
          )}

          {images.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-center p-4">
              <p className="text-xs">Preview Kanvas Video</p>
              <p className="text-[11px] text-slate-600 mt-1">Pilih gambar untuk melihat pratinjau bergerak</p>
            </div>
          )}
        </div>
      </div>

      {/* Scrubber & Controls Bar */}
      <div className="flex flex-col gap-2 p-3 bg-slate-950/90 border-t border-slate-800">
        {/* Scrubber Range */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max={config.durationSeconds}
            step="0.05"
            value={currentTime}
            onChange={handleScrub}
            disabled={images.length === 0}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-40"
          />
        </div>

        {/* Playback Controls & Time Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              disabled={images.length === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white disabled:opacity-40 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={handleRestart}
              disabled={images.length === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
              title="Kembali ke awal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="text-xs font-mono tabular-nums text-slate-300 ml-2">
              <span className="text-white font-medium">{formatTime(currentTime)}</span>
              <span className="text-slate-600 mx-1">/</span>
              <span className="text-slate-400">{formatTime(config.durationSeconds)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="hidden sm:flex items-center gap-1.5 font-mono">
              <span className="text-slate-500">Resolusi:</span>
              <span className="text-slate-300">{config.width}x{config.height}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">{config.fps}fps</span>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
