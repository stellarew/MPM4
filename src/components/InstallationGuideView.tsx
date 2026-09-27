import React, { useState } from 'react';
import {
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  HelpCircle,
  Laptop,
  Apple,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type OperatingSystem = 'windows' | 'mac' | 'linux';

export const InstallationGuideView: React.FC = () => {
  const [os, setOs] = useState<OperatingSystem>('windows');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
      {/* Title */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Terminal className="w-6 h-6 text-indigo-400" />
          <span>Panduan Instalasi Python & FFmpeg untuk Awam</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Ikuti langkah-langkah di bawah ini untuk menyiapkan lingkungan komputer lokal Anda agar konversi gambar ke video MP4 dapat berjalan 100% offline dengan lancar dan cepat.
        </p>
      </div>

      {/* OS Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl self-start">
        <button
          onClick={() => setOs('windows')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            os === 'windows'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Windows 11 / 10</span>
        </button>

        <button
          onClick={() => setOs('mac')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            os === 'mac'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Apple className="w-4 h-4" />
          <span>macOS (Mac)</span>
        </button>

        <button
          onClick={() => setOs('linux')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            os === 'linux'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Linux (Ubuntu / Debian)</span>
        </button>
      </div>

      {/* Step by Step Flow */}
      <div className="flex flex-col gap-6">
        {/* STEP 1: PYTHON */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-950 text-indigo-400 font-bold text-xs border border-indigo-700/60">
              1
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              Langkah 1: Memasang Python di Komputer
            </h2>
          </div>

          {os === 'windows' && (
            <div className="flex flex-col gap-3 text-xs text-slate-300 leading-relaxed pl-10">
              <p>
                Anda memiliki dua cara mudah untuk memasang Python di Windows:
              </p>

              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2">
                <span className="font-semibold text-indigo-300">
                  Cara Cepat via Windows Package Manager (PowerShell):
                </span>
                <p className="text-slate-400">
                  Buka <b>PowerShell</b> (Klik kanan tombol Start &gt; pilih Terminal / PowerShell), lalu salin perintah ini:
                </p>
                <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded border border-slate-800 font-mono text-slate-200">
                  <code>winget install Python.Python.3.11</code>
                  <button
                    onClick={() => handleCopy('winget install Python.Python.3.11', 1)}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 1 ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2">
                <span className="font-semibold text-slate-200">
                  Atau Cara Manual Mengunduh Installer Resmi:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Buka website resmi: <a href="https://www.python.org/downloads/" target="_blank" rel="noreferrer" className="text-indigo-400 underline">python.org/downloads</a></li>
                  <li>Klik tombol kuning <b>"Download Python 3.x.x"</b>.</li>
                  <li>Buka file installer yang terunduh.</li>
                  <li className="text-amber-300 font-medium">
                    ⚠️ <b>SANGAT PENTING:</b> Di layar pertama installer, centang kotak <b>"Add python.exe to PATH"</b> di bagian paling bawah sebelum klik "Install Now"!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {os === 'mac' && (
            <div className="flex flex-col gap-3 text-xs text-slate-300 leading-relaxed pl-10">
              <p>
                Gunakan <b>Homebrew</b> (package manager resmi untuk Mac) di aplikasi Terminal:
              </p>
              <div className="flex items-center justify-between bg-slate-950 px-3 py-2.5 rounded border border-slate-800 font-mono text-slate-200">
                <code>brew install python python-tk</code>
                <button
                  onClick={() => handleCopy('brew install python python-tk', 2)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 2 ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
          )}

          {os === 'linux' && (
            <div className="flex flex-col gap-3 text-xs text-slate-300 leading-relaxed pl-10">
              <p>
                Buka Terminal Linux (Ctrl+Alt+T) lalu jalankan perintah apt berikut:
              </p>
              <div className="flex items-center justify-between bg-slate-950 px-3 py-2.5 rounded border border-slate-800 font-mono text-slate-200">
                <code>sudo apt update && sudo apt install -y python3 python3-pip python3-tk</code>
                <button
                  onClick={() => handleCopy('sudo apt update && sudo apt install -y python3 python3-pip python3-tk', 3)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                  {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 3 ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: FFMPEG */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-950 text-indigo-400 font-bold text-xs border border-indigo-700/60">
              2
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              Langkah 2: Memasang FFmpeg (Mesin Pemroses Video Offline)
            </h2>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed pl-10 flex flex-col gap-3">
            <p>
              FFmpeg adalah software open-source industri terkemuka untuk encoding MP4 berkecepatan tinggi tanpa batas secara lokal di komputer.
            </p>

            {os === 'windows' && (
              <div className="flex flex-col gap-3">
                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2">
                  <span className="font-semibold text-emerald-400">
                    Rekomendasi (Otomatis 1 Baris via Windows Package Manager):
                  </span>
                  <p className="text-slate-400">
                    Buka <b>PowerShell</b> dan jalankan perintah di bawah. Sistem akan otomatis mengunduh dan mengatur PATH:
                  </p>
                  <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded border border-slate-800 font-mono text-slate-200">
                    <code>winget install Gyan.FFmpeg</code>
                    <button
                      onClick={() => handleCopy('winget install Gyan.FFmpeg', 4)}
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                    >
                      {copiedIndex === 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === 4 ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-400">
                  <span className="font-semibold text-slate-200 block mb-1">Alternatif Chocolatey / Scoop:</span>
                  <code className="text-indigo-300">choco install ffmpeg</code> atau <code className="text-indigo-300">scoop install ffmpeg</code>
                </div>
              </div>
            )}

            {os === 'mac' && (
              <div className="flex items-center justify-between bg-slate-950 px-3 py-2.5 rounded border border-slate-800 font-mono text-slate-200">
                <code>brew install ffmpeg</code>
                <button
                  onClick={() => handleCopy('brew install ffmpeg', 5)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                  {copiedIndex === 5 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 5 ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            )}

            {os === 'linux' && (
              <div className="flex items-center justify-between bg-slate-950 px-3 py-2.5 rounded border border-slate-800 font-mono text-slate-200">
                <code>sudo apt install -y ffmpeg</code>
                <button
                  onClick={() => handleCopy('sudo apt install -y ffmpeg', 6)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                  {copiedIndex === 6 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 6 ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* STEP 3: VERIFIKASI */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-700/60">
              3
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              Langkah 3: Buka Terminal dan Pastikan Keduanya Terpasang Benar
            </h2>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed pl-10 flex flex-col gap-3">
            <p className="text-amber-200 font-medium">
              💡 Tutup jendela terminal lama Anda dan buka jendela terminal BARU agar path environment ter-refresh.
            </p>

            <div className="flex flex-col gap-2">
              <span className="font-semibold text-slate-200">1. Cek Python:</span>
              <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded border border-slate-800 font-mono text-slate-200">
                <code>python --version</code>
                <button
                  onClick={() => handleCopy('python --version', 7)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                  {copiedIndex === 7 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 7 ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Respon normal: <span className="text-emerald-400 font-mono">Python 3.11.x</span> (atau versi 3.8+)
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="font-semibold text-slate-200">2. Cek FFmpeg:</span>
              <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded border border-slate-800 font-mono text-slate-200">
                <code>ffmpeg -version</code>
                <button
                  onClick={() => handleCopy('ffmpeg -version', 8)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                  {copiedIndex === 8 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 8 ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Respon normal: <span className="text-emerald-400 font-mono">ffmpeg version 6.x / 7.x Copyright (c) 2000-2024 the FFmpeg developers</span>
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="font-semibold text-slate-200">3. Pasang Library Gambar (Pillow):</span>
              <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded border border-slate-800 font-mono text-slate-200">
                <code>pip install Pillow</code>
                <button
                  onClick={() => handleCopy('pip install Pillow', 9)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                  {copiedIndex === 9 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 9 ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 4: CARA JALANKAN */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-950 text-indigo-400 font-bold text-xs border border-indigo-700/60">
              4
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              Langkah 4: Menjalankan Software di Komputer Anda
            </h2>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed pl-10 flex flex-col gap-3">
            <p>
              Setelah mengunduh file paket dari tab <b>"Software PC & Script"</b> (atau tombol Unduh Paket di atas):
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2">
                <span className="font-semibold text-white">A. Menjalankan Tampilan GUI Jendela (Mudah)</span>
                <p className="text-slate-400 text-[11px]">
                  Buka folder file yang diekstrak, lalu jalankan di terminal:
                </p>
                <div className="bg-slate-900 p-2 rounded font-mono text-indigo-300 text-[11px]">
                  python app_gui.py
                </div>
                <p className="text-slate-400 text-[11px]">
                  (Di Windows, Anda juga bisa langsung klik dua kali <code>setup_windows.bat</code>).
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2">
                <span className="font-semibold text-white">B. Menjalankan Lewat Command Line (CLI)</span>
                <p className="text-slate-400 text-[11px]">
                  Contoh konversi kumpulan gambar dalam 1 folder menjadi video 30 detik:
                </p>
                <div className="bg-slate-900 p-2 rounded font-mono text-indigo-300 text-[11px] break-all">
                  python convert_cli.py -i ./foto -o output.mp4 -d 30
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TROUBLESHOOTING FAQ */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              Solusi Masalah Umum (Troubleshooting untuk Pemula)
            </h2>
          </div>

          <div className="flex flex-col gap-3 pl-7 text-xs">
            {[
              {
                q: "Muncul pesan 'python is not recognized as an internal or external command'",
                a: "Ini berarti Python belum ditambahkan ke System Environment Variables (PATH). Solusi termudah: Buka installer Python lagi, pilih 'Modify', lalu centang opsi 'Add Python to environment variables'. Atau jika menggunakan winget, restart komputer Anda sekali.",
              },
              {
                q: "Muncul pesan 'ffmpeg is not recognized'",
                a: "Jika baru saja menginstall lewat 'winget install Gyan.FFmpeg', tutup semua jendela CMD/PowerShell yang sedang terbuka, lalu buka kembali jendela yang baru. PATH FFmpeg baru terbaca pada sesi terminal baru.",
              },
              {
                q: "Di Linux muncul error: 'No module named _tkinter'",
                a: "Tkinter belum terpasang di sistem Linux Anda. Cukup jalankan perintah: sudo apt install python3-tk lalu coba buka kembali aplikasinya.",
              },
              {
                q: "Apakah video MP4 hasil konversi bisa diputar di HP Android / iPhone?",
                a: "Ya! Script kami secara otomatis menyertakan parameter '-c:v libx264 -pix_fmt yuv420p' yang merupakan standar H.264 kompatibilitas universal untuk WhatsApp, Instagram, TikTok, iPhone, dan Android.",
              },
              {
                q: "Apakah proses konversi ini aman dan benar-benar offline?",
                a: "100% aman dan offline. Gambar dan video Anda tidak pernah dikirim ke internet atau server pihak ketiga mana pun. Seluruh kalkulasi rendering terjadi di prosesor komputer Anda sendiri.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="border border-slate-800 rounded-lg bg-slate-950 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-3 text-left font-medium text-slate-200 hover:text-white transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openFaq === i && (
                  <div className="p-3 pt-0 text-slate-400 border-t border-slate-800/80 bg-slate-950/40 leading-relaxed text-[11px]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
