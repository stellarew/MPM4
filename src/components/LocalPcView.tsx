import React, { useState } from 'react';
import { VideoConfig } from '../types';
import {
  getPythonGuiScript,
  getPythonCliScript,
  getWindowsBatchScript,
  getMacLinuxBashScript,
  getRequirementsTxt,
  getReadmeMd,
} from '../utils/pythonScripts';
import { downloadLocalSoftwarePackage, downloadSingleFile } from '../utils/zipDownloader';
import {
  Download,
  Copy,
  Check,
  Terminal,
  FileCode,
  FolderArchive,
  ArrowRight,
  ExternalLink,
  Laptop,
} from 'lucide-react';

interface LocalPcViewProps {
  config: VideoConfig;
  onNavigateToGuide: () => void;
}

type ScriptTab = 'gui' | 'cli' | 'bat' | 'sh' | 'req' | 'readme';

export const LocalPcView: React.FC<LocalPcViewProps> = ({ config, onNavigateToGuide }) => {
  const [activeTab, setActiveTab] = useState<ScriptTab>('gui');
  const [copied, setCopied] = useState<boolean>(false);
  const [cliCopied, setCliCopied] = useState<boolean>(false);

  const guiCode = getPythonGuiScript({
    defaultDuration: config.durationSeconds,
    defaultFps: config.fps,
    defaultAspect: config.aspectRatio,
  });
  const cliCode = getPythonCliScript();
  const batCode = getWindowsBatchScript();
  const shCode = getMacLinuxBashScript();
  const reqCode = getRequirementsTxt();
  const readmeCode = getReadmeMd();

  const getActiveContent = (): { filename: string; code: string; lang: string } => {
    switch (activeTab) {
      case 'gui':
        return { filename: 'app_gui.py', code: guiCode, lang: 'python' };
      case 'cli':
        return { filename: 'convert_cli.py', code: cliCode, lang: 'python' };
      case 'bat':
        return { filename: 'setup_windows.bat', code: batCode, lang: 'batch' };
      case 'sh':
        return { filename: 'setup_mac_linux.sh', code: shCode, lang: 'bash' };
      case 'req':
        return { filename: 'requirements.txt', code: reqCode, lang: 'text' };
      case 'readme':
        return { filename: 'README.md', code: readmeCode, lang: 'markdown' };
    }
  };

  const current = getActiveContent();

  const handleCopy = (text: string, isCli = false) => {
    navigator.clipboard.writeText(text);
    if (isCli) {
      setCliCopied(true);
      setTimeout(() => setCliCopied(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate live FFmpeg 1-line command corresponding to current settings
  const generateFfmpegOneLiner = () => {
    let res = '1920:1080';
    if (config.aspectRatio === '9:16') res = '1080:1920';
    else if (config.aspectRatio === '1:1') res = '1080:1080';
    else if (config.aspectRatio === '4:5') res = '1080:1350';

    return `ffmpeg -framerate 1/${(config.durationSeconds / 4).toFixed(1)} -pattern_type glob -i "*.jpg" -c:v libx264 -vf "scale=${res}:force_original_aspect_ratio=decrease,pad=${res}:(ow-iw)/2:(oh-ih)/2,format=yuv420p" -r ${config.fps} -t ${config.durationSeconds} output.mp4`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Laptop className="w-6 h-6 text-indigo-400" />
            <span>Software PC & Backend Python + FFmpeg</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Jalankan converter secara 100% offline di PC lokal Anda menggunakan Python & FFmpeg. Dilengkapi GUI jendela desktop bawaan (Tkinter) dan CLI tanpa ketergantungan internet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => downloadLocalSoftwarePackage(config)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-950/60 transition-all active:scale-95 whitespace-nowrap"
          >
            <FolderArchive className="w-4 h-4" />
            <span>Unduh Paket Lengkap (.ZIP)</span>
          </button>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <span>Opsi 1</span>
              <span>·</span>
              <span>1-Klik Setup Windows</span>
            </div>
            <h3 className="text-sm font-semibold text-white mt-1">setup_windows.bat</h3>
            <p className="text-xs text-slate-400 mt-1">
              Otomatis mendeteksi Python & FFmpeg, menginstall via winget bila belum ada, dan membuka GUI desktop.
            </p>
          </div>
          <button
            onClick={() => downloadSingleFile('setup_windows.bat', batCode, 'application/x-bat')}
            className="self-start flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh .bat</span>
          </button>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span>Opsi 2</span>
              <span>·</span>
              <span>Desktop GUI Python</span>
            </div>
            <h3 className="text-sm font-semibold text-white mt-1">app_gui.py (Tkinter)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Aplikasi visual dengan slider durasi 10s-60s, pilihan resolusi, musik latar, dan pemrosesan FFmpeg lokal.
            </p>
          </div>
          <button
            onClick={() => downloadSingleFile('app_gui.py', guiCode, 'text/x-python')}
            className="self-start flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh app_gui.py</span>
          </button>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <span>Opsi 3</span>
              <span>·</span>
              <span>Command Line (CLI)</span>
            </div>
            <h3 className="text-sm font-semibold text-white mt-1">convert_cli.py</h3>
            <p className="text-xs text-slate-400 mt-1">
              Eksekusi batch langsung lewat terminal atau integrasikan ke workflow otomatisasi lokal Anda.
            </p>
          </div>
          <button
            onClick={() => downloadSingleFile('convert_cli.py', cliCode, 'text/x-python')}
            className="self-start flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh convert_cli.py</span>
          </button>
        </div>
      </div>

      {/* Dynamic 1-Line FFmpeg Command Generator */}
      <div className="p-5 rounded-xl border border-indigo-900/40 bg-indigo-950/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-semibold text-indigo-200">
              Perintah Cepat FFmpeg Langsung (Sesuai Pengaturan Studio Anda)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-indigo-400">
            {config.durationSeconds}s · {config.aspectRatio} · {config.fps}fps
          </span>
        </div>

        <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 overflow-x-auto">
          <code>{generateFfmpegOneLiner()}</code>
          <button
            onClick={() => handleCopy(generateFfmpegOneLiner(), true)}
            className="ml-auto shrink-0 pl-3 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-sans"
          >
            {cliCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Perintah</span>
              </>
            )}
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          Jalankan perintah di atas langsung di dalam folder gambar foto Anda di terminal/PowerShell komputer Anda.
        </p>
      </div>

      {/* Source Code Viewer Section */}
      <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5 overflow-x-auto">
          <div className="flex items-center gap-1">
            {[
              { id: 'gui', label: 'app_gui.py (Desktop)', icon: FileCode },
              { id: 'cli', label: 'convert_cli.py (CLI)', icon: Terminal },
              { id: 'bat', label: 'setup_windows.bat', icon: FileCode },
              { id: 'sh', label: 'setup_mac_linux.sh', icon: FileCode },
              { id: 'req', label: 'requirements.txt', icon: FileCode },
              { id: 'readme', label: 'README.md', icon: FileCode },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ScriptTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-slate-800 text-white font-medium border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pl-3">
            <button
              onClick={() => handleCopy(current.code)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>

            <button
              onClick={() => downloadSingleFile(current.filename, current.code)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh {current.filename}</span>
            </button>
          </div>
        </div>

        {/* Code View Area */}
        <div className="relative max-h-[500px] overflow-auto p-4 bg-slate-950 font-mono text-xs leading-relaxed text-slate-300">
          <pre className="whitespace-pre">{current.code}</pre>
        </div>
      </div>

      {/* Guide Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/40">
        <div>
          <h4 className="text-xs font-semibold text-white">Belum memasang Python atau FFmpeg di sistem Anda?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Baca panduan instalasi langkah demi langkah untuk pemula lengkap dengan perintah verifikasi.
          </p>
        </div>
        <button
          onClick={onNavigateToGuide}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
        >
          <span>Buka Panduan Instalasi</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
