import React, { useEffect } from 'react';
import { RenderProgress } from '../types';
import { Download, CheckCircle2, AlertCircle, X, Play, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  progress: RenderProgress;
  onClose: () => void;
  onCancel: () => void;
  outputVideoName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  progress,
  onClose,
  onCancel,
  outputVideoName,
}) => {
  useEffect(() => {
    if (progress.status === 'completed') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [progress.status]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Close button if finished or error */}
        {(progress.status === 'completed' || progress.status === 'error') && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Title */}
        <div className="mb-5">
          <h3 className="text-base font-bold text-white">
            {progress.status === 'completed'
              ? 'Export Video MP4 Selesai!'
              : progress.status === 'error'
              ? 'Export Gagal'
              : 'Memproses Video MP4 (100% Offline)'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {progress.status === 'completed'
              ? 'Video MP4 telah berhasil di-render dan siap disimpan ke komputer Anda.'
              : progress.status === 'error'
              ? progress.error || 'Terjadi kesalahan saat memproses frame video.'
              : 'Pemrosesan frame berjalan murni di CPU/GPU browser tanpa koneksi internet.'}
          </p>
        </div>

        {/* In-Progress State */}
        {(progress.status === 'rendering' || progress.status === 'muxing') && (
          <div className="flex flex-col gap-4">
            {/* Progress Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">
                  {progress.status === 'muxing' ? 'Finalisasi kontainer MP4...' : 'Render Frame...'}
                </span>
                <span className="text-indigo-400 font-semibold tabular-nums">{progress.percent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-150 ease-out"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs font-mono">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Frame</p>
                <p className="text-slate-200 tabular-nums font-semibold mt-0.5">
                  {progress.currentFrame} / {progress.totalFrames}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Kecepatan</p>
                <p className="text-slate-200 tabular-nums font-semibold mt-0.5">
                  {progress.fps} FPS
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Estimasi Sisa</p>
                <p className="text-slate-200 tabular-nums font-semibold mt-0.5">
                  ~{progress.etaSeconds}s
                </p>
              </div>
            </div>

            {/* Cancel Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Batalkan
              </button>
            </div>
          </div>
        )}

        {/* Completed State */}
        {progress.status === 'completed' && progress.outputBlobUrl && (
          <div className="flex flex-col gap-4">
            {/* Video Player Preview of the generated MP4 */}
            <div className="relative aspect-video w-full rounded-xl bg-black overflow-hidden border border-slate-800">
              <video
                src={progress.outputBlobUrl}
                controls
                autoPlay
                loop
                className="w-full h-full object-contain"
              />
            </div>

            {/* File info (Unboxed anti-slop metadata) */}
            <div className="flex items-center justify-between text-xs text-slate-400 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/60 font-mono">
              <span className="truncate max-w-[240px] text-slate-300 font-medium">
                {outputVideoName}
              </span>
              <span className="tabular-nums text-emerald-400 font-semibold">
                {progress.fileSizeMb} MB
              </span>
            </div>

            {/* Download Button */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href={progress.outputBlobUrl}
                download={outputVideoName}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/60 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Simpan File Video (.MP4)</span>
              </a>

              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {progress.status === 'error' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Gagal Meng-encode Video</p>
                <p className="mt-1 text-rose-300/90 font-mono text-[11px] leading-relaxed">
                  {progress.error}
                </p>
                <p className="mt-2 text-rose-400 text-[11px]">
                  Tips: Anda juga bisa menggunakan tab <b>"Software PC & Script"</b> untuk menjalankan konversi dengan FFmpeg lokal berkecepatan tinggi!
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
