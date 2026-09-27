import React, { useRef } from 'react';
import { ImageItem } from '../types';
import { Upload, Trash2, ArrowUp, ArrowDown, Sparkles, Image as ImageIcon } from 'lucide-react';

// Static demo image imports
import demoMountain from '../assets/images/demo_mountain_lake_1790484928737.jpg';
import demoCyber from '../assets/images/demo_cyber_city_1790484939536.jpg';
import demoCoastal from '../assets/images/demo_coastal_sunset_1790484951783.jpg';
import demoForest from '../assets/images/demo_forest_mist_1790484964146.jpg';

interface ImageManagerProps {
  images: ImageItem[];
  onAddImages: (files: FileList | File[]) => void;
  onRemoveImage: (id: string) => void;
  onMoveImage: (index: number, direction: 'up' | 'down') => void;
  onClearImages: () => void;
  onLoadDemoImages: () => void;
  durationSeconds: number;
}

export const DEMO_PRESETS: Array<{ id: string; name: string; url: string; width: number; height: number }> = [
  { id: 'demo-1', name: 'Alps Alpine Lake.jpg', url: demoMountain, width: 1920, height: 1080 },
  { id: 'demo-2', name: 'Twilight Skyline.jpg', url: demoCyber, width: 1920, height: 1080 },
  { id: 'demo-3', name: 'Coastal Sunset.jpg', url: demoCoastal, width: 1920, height: 1080 },
  { id: 'demo-4', name: 'Redwood Mist.jpg', url: demoForest, width: 1920, height: 1080 },
];

export const ImageManager: React.FC<ImageManagerProps> = ({
  images,
  onAddImages,
  onRemoveImage,
  onMoveImage,
  onClearImages,
  onLoadDemoImages,
  durationSeconds,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddImages(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const perSlideDuration = images.length > 0 ? (durationSeconds / images.length).toFixed(1) : '0';

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Stats (Anti-slop zero pill metadata) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-white">
            Daftar Gambar Slideshow
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span className="font-mono tabular-nums">{images.length} gambar</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">~{perSlideDuration}s per gambar</span>
            <span aria-hidden="true">·</span>
            <span>100% diproses di browser (Offline)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {images.length === 0 && (
            <button
              onClick={onLoadDemoImages}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Muat 4 Contoh Foto HD</span>
            </button>
          )}

          {images.length > 0 && (
            <button
              onClick={onClearImages}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="group relative flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-xl p-5 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-all"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onAddImages(e.target.files);
              e.target.value = '';
            }
          }}
        />
        <div className="p-2.5 rounded-full bg-slate-800 text-slate-300 group-hover:text-indigo-400 group-hover:bg-slate-700 transition-colors mb-2">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-200">
          Klik atau Tarik File Gambar ke Sini
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Mendukung JPG, PNG, WEBP, BMP (Pilih beberapa sekaligus)
        </p>
      </div>

      {/* Image Thumbnails List */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {images.map((item, index) => (
            <div
              key={item.id}
              className="group relative flex flex-col bg-slate-900 border border-slate-800 rounded-lg overflow-hidden transition-all hover:border-slate-700"
            >
              {/* Order Number Badge */}
              <div className="absolute top-1.5 left-1.5 z-10 bg-slate-950/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold text-slate-200 border border-slate-800">
                #{index + 1}
              </div>

              {/* Action Buttons Overlay */}
              <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {index > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveImage(index, 'up');
                    }}
                    title="Geser ke kiri / urutan sebelumnya"
                    className="p-1 rounded bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                )}
                {index < images.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveImage(index, 'down');
                    }}
                    title="Geser ke kanan / urutan berikutnya"
                    className="p-1 rounded bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(item.id);
                  }}
                  title="Hapus gambar"
                  className="p-1 rounded bg-slate-950/80 hover:bg-rose-900/80 text-rose-300 border border-slate-700 hover:border-rose-700 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Image Preview Container */}
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Caption */}
              <div className="p-2 border-t border-slate-800/80">
                <p className="text-[11px] font-medium text-slate-300 truncate" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>{item.width && item.height ? `${item.width}x${item.height}` : 'Auto'}</span>
                  <span>~{perSlideDuration}s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border border-slate-800/60 rounded-xl bg-slate-900/20 text-center">
          <ImageIcon className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-xs text-slate-400">Belum ada gambar yang dipilih.</p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
            Tambahkan minimal 1 gambar foto untuk membuat video MP4 durasi 10 hingga 60 detik.
          </p>
          <button
            onClick={onLoadDemoImages}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/50 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gunakan 4 Foto Demo Siap Pakai</span>
          </button>
        </div>
      )}
    </div>
  );
};
