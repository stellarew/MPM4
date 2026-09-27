import React, { useRef } from 'react';
import { ImageItem, VideoConfig, AspectRatio, TransitionType, FitMode } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { ImageManager } from './ImageManager';
import {
  Clock,
  Layers,
  Sparkles,
  Music,
  Type,
  Monitor,
  Zap,
  Sliders,
  ChevronRight,
  Upload,
} from 'lucide-react';

interface StudioViewProps {
  images: ImageItem[];
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
  onAddImages: (files: FileList | File[]) => void;
  onRemoveImage: (id: string) => void;
  onMoveImage: (index: number, direction: 'up' | 'down') => void;
  onClearImages: () => void;
  onLoadDemoImages: () => void;
  onStartExport: () => void;
  onSwitchToLocalPc: () => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  images,
  config,
  setConfig,
  onAddImages,
  onRemoveImage,
  onMoveImage,
  onClearImages,
  onLoadDemoImages,
  onStartExport,
  onSwitchToLocalPc,
}) => {
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleDurationChange = (val: number) => {
    setConfig((prev) => ({
      ...prev,
      durationSeconds: Math.max(10, Math.min(60, val)),
    }));
  };

  const handleAspectRatioChange = (aspect: AspectRatio) => {
    let width = 1920;
    let height = 1080;

    switch (aspect) {
      case '9:16':
        width = 1080;
        height = 1920;
        break;
      case '1:1':
        width = 1080;
        height = 1080;
        break;
      case '4:5':
        width = 1080;
        height = 1350;
        break;
      case '16:9':
      default:
        width = 1920;
        height = 1080;
        break;
    }

    setConfig((prev) => ({
      ...prev,
      aspectRatio: aspect,
      width,
      height,
    }));
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setConfig((prev) => ({
        ...prev,
        includeAudio: true,
        audioType: 'custom',
        audioFileName: file.name,
      }));
    }
  };

  const durationPresets = [
    { label: '10s (Teaser)', val: 10 },
    { label: '15s (Story)', val: 15 },
    { label: '30s (Promo)', val: 30 },
    { label: '45s', val: 45 },
    { label: '60s (Full)', val: 60 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Konversi Gambar ke Video MP4
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Buat video slideshow MP4 resolusi tinggi (10 detik - 60 detik) langsung di browser Anda secara 100% offline tanpa mengunggah data ke server internet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToLocalPc}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>Butuh FFmpeg / Python lokal?</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Preview & Images, Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Player & Image Manager (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Interactive Canvas Video Preview */}
          <VideoPlayer images={images} config={config} />

          {/* Image Manager Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <ImageManager
              images={images}
              onAddImages={onAddImages}
              onRemoveImage={onRemoveImage}
              onMoveImage={onMoveImage}
              onClearImages={onClearImages}
              onLoadDemoImages={onLoadDemoImages}
              durationSeconds={config.durationSeconds}
            />
          </div>
        </div>

        {/* Right Column: Configuration Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Pengaturan Video MP4</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Offline WebCodecs</span>
            </div>

            {/* 1. Duration Slider (10s to 60s) */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Total Durasi Video:</span>
                </label>
                <span className="font-mono text-xs font-bold text-indigo-400 tabular-nums bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                  {config.durationSeconds} Detik
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="60"
                step="1"
                value={config.durationSeconds}
                onChange={(e) => handleDurationChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {durationPresets.map((preset) => (
                  <button
                    key={preset.val}
                    onClick={() => handleDurationChange(preset.val)}
                    className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                      config.durationSeconds === preset.val
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Aspect Ratio Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                <span>Aspek Rasio & Ukuran:</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '16:9', title: '16:9 Landscape', desc: 'YouTube & Desktop' },
                  { id: '9:16', title: '9:16 Vertical', desc: 'TikTok / Reels / Shorts' },
                  { id: '1:1', title: '1:1 Persegi', desc: 'Instagram Feed' },
                  { id: '4:5', title: '4:5 Portrait', desc: 'Social Media Feed' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAspectRatioChange(item.id as AspectRatio)}
                    className={`flex flex-col text-left p-2.5 rounded-lg border transition-all ${
                      config.aspectRatio === item.id
                        ? 'bg-indigo-950/40 border-indigo-500 text-white'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-semibold">{item.title}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Transition Style */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                <span>Efek Transisi:</span>
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'kenburns', label: 'Ken Burns (Pan)' },
                  { id: 'crossfade', label: 'Crossfade' },
                  { id: 'slide', label: 'Slide Geser' },
                  { id: 'zoom', label: 'Zoom Masuk' },
                  { id: 'fade_black', label: 'Fade Hitam' },
                  { id: 'cut', label: 'Cut Langsung' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setConfig((p) => ({ ...p, transition: t.id as TransitionType }))}
                    className={`px-2 py-1.5 text-[11px] rounded border transition-colors ${
                      config.transition === t.id
                        ? 'bg-indigo-600 border-indigo-500 text-white font-medium'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Fit Mode & FPS */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/60">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Skala Gambar:</label>
                <div className="flex gap-1 bg-slate-950/50 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setConfig((p) => ({ ...p, fitMode: 'cover' }))}
                    className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                      config.fitMode === 'cover' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Cover (Penuh)
                  </button>
                  <button
                    onClick={() => setConfig((p) => ({ ...p, fitMode: 'contain' }))}
                    className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                      config.fitMode === 'contain' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Contain (Utuh)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Frame Rate:</label>
                <div className="flex gap-1 bg-slate-950/50 p-1 rounded-lg border border-slate-800">
                  {[24, 30, 60].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setConfig((p) => ({ ...p, fps: rate }))}
                      className={`flex-1 py-1 text-[11px] font-mono rounded transition-colors ${
                        config.fps === rate ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {rate}fps
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Audio Options */}
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/60">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-slate-400" />
                  <span>Musik Latar (Audio):</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Opsional</span>
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setConfig((p) => ({ ...p, includeAudio: false, audioType: 'none' }))}
                  className={`px-2 py-1.5 text-[11px] rounded border transition-colors ${
                    !config.includeAudio
                      ? 'bg-slate-800 border-slate-700 text-white font-medium'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tanpa Audio
                </button>

                <button
                  onClick={() => setConfig((p) => ({ ...p, includeAudio: true, audioType: 'ambient' }))}
                  className={`px-2 py-1.5 text-[11px] rounded border transition-colors ${
                    config.includeAudio && config.audioType === 'ambient'
                      ? 'bg-indigo-600 border-indigo-500 text-white font-medium'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Lofi Ambient
                </button>

                <button
                  onClick={() => audioInputRef.current?.click()}
                  className={`px-2 py-1.5 text-[11px] rounded border transition-colors flex items-center justify-center gap-1 ${
                    config.includeAudio && config.audioType === 'custom'
                      ? 'bg-indigo-600 border-indigo-500 text-white font-medium'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Pilih MP3</span>
                </button>

                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleAudioUpload}
                />
              </div>

              {config.includeAudio && config.audioType === 'custom' && config.audioFileName && (
                <p className="text-[11px] text-indigo-300 font-mono truncate">
                  File: {config.audioFileName}
                </p>
              )}
            </div>

            {/* 6. Text Overlay / Watermark */}
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/60">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-slate-400" />
                <span>Teks Judul / Watermark (Opsional):</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: Liburan 2026 atau @username"
                  value={config.overlayText}
                  onChange={(e) => setConfig((p) => ({ ...p, overlayText: e.target.value }))}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />

                <select
                  value={config.overlayPosition}
                  onChange={(e) =>
                    setConfig((p) => ({
                      ...p,
                      overlayPosition: e.target.value as VideoConfig['overlayPosition'],
                    }))
                  }
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="bottom">Bawah Tengah</option>
                  <option value="top">Atas Tengah</option>
                  <option value="center">Tengah</option>
                  <option value="watermark">Watermark Pojok</option>
                </select>
              </div>
            </div>

            {/* Big Action Button */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={onStartExport}
                disabled={images.length === 0}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                  images.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/60 hover:shadow-emerald-900/80 active:scale-98 cursor-pointer'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>MULAI CONVERT KE MP4 OFFLINE</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
                <span>Durasi: {config.durationSeconds}s</span>
                <span>{config.width}x{config.height}</span>
                <span>{config.fps} FPS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
