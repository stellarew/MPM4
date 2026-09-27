/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ImageItem, VideoConfig, RenderProgress } from './types';
import { TopBar } from './components/TopBar';
import { StudioView } from './components/StudioView';
import { LocalPcView } from './components/LocalPcView';
import { InstallationGuideView } from './components/InstallationGuideView';
import { ExportModal } from './components/ExportModal';
import { exportVideoToMp4 } from './utils/videoRenderer';
import { downloadLocalSoftwarePackage } from './utils/zipDownloader';
import { DEMO_PRESETS } from './components/ImageManager';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'local_pc' | 'guide'>('studio');

  // Initial images state loaded with high-res demo photos so user can test immediately
  const [images, setImages] = useState<ImageItem[]>(DEMO_PRESETS);

  // Video Configuration
  const [config, setConfig] = useState<VideoConfig>({
    durationSeconds: 30,
    fps: 30,
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    transition: 'kenburns',
    transitionDuration: 1.0,
    fitMode: 'cover',
    overlayText: '',
    overlayPosition: 'bottom',
    includeAudio: false,
    audioType: 'none',
  });

  // Export State
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<RenderProgress>({
    status: 'idle',
    currentFrame: 0,
    totalFrames: 0,
    percent: 0,
    fps: 0,
    etaSeconds: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Add images from file picker / drag & drop
  const handleAddImages = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const newItems: ImageItem[] = fileArray.map((file) => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      width: 0,
      height: 0,
    }));

    setImages((prev) => [...prev, ...newItems]);
  };

  // Remove single image
  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const removed = prev.find((item) => item.id === id);
      if (removed && removed.url.startsWith('blob:')) {
        URL.revokeObjectURL(removed.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  // Reorder images
  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Clear all images
  const handleClearImages = () => {
    images.forEach((item) => {
      if (item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
    });
    setImages([]);
  };

  // Load demo images
  const handleLoadDemoImages = () => {
    setImages(DEMO_PRESETS);
  };

  // Start Video Export
  const handleStartExport = async () => {
    if (images.length === 0) return;

    abortControllerRef.current = new AbortController();
    setIsExportModalOpen(true);
    setExportProgress({
      status: 'rendering',
      currentFrame: 0,
      totalFrames: Math.round(config.durationSeconds * config.fps),
      percent: 0,
      fps: 0,
      etaSeconds: 0,
    });

    try {
      await exportVideoToMp4(
        images,
        config,
        (progress) => {
          setExportProgress(progress);
        },
        abortControllerRef.current.signal
      );
    } catch (err: unknown) {
      if (abortControllerRef.current?.signal.aborted) {
        console.log('Rendering cancelled by user.');
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses video.';
        setExportProgress((prev) => ({
          ...prev,
          status: 'error',
          error: errorMsg,
        }));
      }
    }
  };

  // Cancel Video Export
  const handleCancelExport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsExportModalOpen(false);
  };

  // Download Suite Zip
  const handleDownloadSuite = () => {
    downloadLocalSoftwarePackage(config);
  };

  const outputVideoName = `pictura_${config.durationSeconds}s_${config.aspectRatio.replace(':', 'x')}.mp4`;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Top Bar Contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadSuite={handleDownloadSuite}
        onTriggerExport={handleStartExport}
        imagesCount={images.length}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'studio' && (
          <StudioView
            images={images}
            config={config}
            setConfig={setConfig}
            onAddImages={handleAddImages}
            onRemoveImage={handleRemoveImage}
            onMoveImage={handleMoveImage}
            onClearImages={handleClearImages}
            onLoadDemoImages={handleLoadDemoImages}
            onStartExport={handleStartExport}
            onSwitchToLocalPc={() => setActiveTab('local_pc')}
          />
        )}

        {activeTab === 'local_pc' && (
          <LocalPcView
            config={config}
            onNavigateToGuide={() => setActiveTab('guide')}
          />
        )}

        {activeTab === 'guide' && <InstallationGuideView />}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        progress={exportProgress}
        onClose={() => setIsExportModalOpen(false)}
        onCancel={handleCancelExport}
        outputVideoName={outputVideoName}
      />
    </div>
  );
}
