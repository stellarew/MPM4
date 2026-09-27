import React from 'react';
import { Download, MonitorPlay } from 'lucide-react';

interface TopBarProps {
  activeTab: 'studio' | 'local_pc' | 'guide';
  setActiveTab: (tab: 'studio' | 'local_pc' | 'guide') => void;
  onDownloadSuite: () => void;
  onTriggerExport: () => void;
  imagesCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onDownloadSuite,
  onTriggerExport,
  imagesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-6 py-3.5 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setActiveTab('studio');
        }}
        className="text-lg font-bold tracking-tight text-white hover:text-indigo-400 transition-colors"
      >
        PicturaMP4
      </a>

      {/* Zone 2: Clean text navigation links (anti-slop, unboxed text links) */}
      <nav className="flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('studio')}
          className={`transition-colors hover:text-white pb-0.5 ${
            activeTab === 'studio'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'text-slate-400'
          }`}
        >
          Studio Web
        </button>

        <button
          onClick={() => setActiveTab('local_pc')}
          className={`transition-colors hover:text-white pb-0.5 ${
            activeTab === 'local_pc'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'text-slate-400'
          }`}
        >
          Software PC & Script
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`transition-colors hover:text-white pb-0.5 ${
            activeTab === 'guide'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'text-slate-400'
          }`}
        >
          Panduan Instalasi
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onDownloadSuite}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700/60 whitespace-nowrap"
          title="Unduh paket lengkap Python & script FFmpeg siap pakai"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Paket PC (.zip)</span>
        </button>

        <button
          onClick={onTriggerExport}
          disabled={imagesCount === 0}
          className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-all whitespace-nowrap ${
            imagesCount === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-900/40 active:scale-95'
          }`}
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          <span>Export MP4</span>
        </button>
      </div>
    </header>
  );
};
