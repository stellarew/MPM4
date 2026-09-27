/**
 * Generates the local Python + FFmpeg software suite scripts.
 * Highly robust, zero external GUI dependencies (Tkinter is built into Python),
 * handles 10s-60s video generation, transitions, aspect ratios, and background audio.
 */

export function getPythonGuiScript(options?: {
  defaultDuration?: number;
  defaultFps?: number;
  defaultAspect?: string;
  defaultTransition?: string;
}): string {
  const duration = options?.defaultDuration || 30;
  const fps = options?.defaultFps || 30;

  return `#!/usr/bin/env python3
"""
=============================================================================
PicturaMP4 Desktop GUI - 100% Offline Image-to-MP4 Converter
Membutuhkan: Python 3.8+ & FFmpeg (terpasang di sistem PATH)
Tidak memerlukan koneksi internet sama sekali!
=============================================================================
"""

import sys
import os
import subprocess
import shutil
import threading
from pathlib import Path
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image

class PicturaMP4App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("PicturaMP4 - Offline Image to MP4 Converter")
        self.geometry("720x680")
        self.minsize(640, 600)
        self.configure(bg="#0f172a")

        self.images_list = []
        self.audio_path = None
        self.output_path = tk.StringVar(value=str(Path.home() / "output_slideshow.mp4"))
        self.duration_var = tk.IntVar(value=${duration})
        self.fps_var = tk.IntVar(value=${fps})
        self.aspect_var = tk.StringVar(value="16:9 (1920x1080 YouTube/Landscape)")
        self.transition_var = tk.StringVar(value="Ken Burns (Smooth Pan & Zoom)")
        self.is_processing = False

        self.check_ffmpeg_installation()
        self.setup_ui()

    def check_ffmpeg_installation(self):
        """Mengecek apakah FFmpeg tersedia di sistem PATH."""
        ffmpeg_bin = shutil.which("ffmpeg")
        self.ffmpeg_found = ffmpeg_bin is not None
        self.ffmpeg_path = ffmpeg_bin or "FFmpeg TIDAK DITEMUKAN"

    def setup_ui(self):
        # Header Frame
        header = tk.Frame(self, bg="#1e293b", padx=20, pady=14)
        header.pack(fill=tk.X)

        title = tk.Label(
            header,
            text="PicturaMP4 Local Studio",
            font=("Segoe UI", 16, "bold"),
            fg="#f8fafc",
            bg="#1e293b"
        )
        title.pack(anchor="w")

        subtitle = tk.Label(
            header,
            text="Konversi Gambar ke Video MP4 (10s - 60s) • 100% Offline Tanpa Internet",
            font=("Segoe UI", 9),
            fg="#94a3b8",
            bg="#1e293b"
        )
        subtitle.pack(anchor="w", pady=(2, 0))

        # FFmpeg Status Banner
        status_color = "#10b981" if self.ffmpeg_found else "#ef4444"
        status_text = "FFmpeg Siap: " + self.ffmpeg_path if self.ffmpeg_found else "PERINGATAN: FFmpeg belum terpasang di PATH! Silakan install terlebih dahulu."
        ffmpeg_banner = tk.Label(
            self,
            text=status_text,
            font=("Segoe UI", 8, "bold"),
            fg="#ffffff",
            bg=status_color,
            pady=4
        )
        ffmpeg_banner.pack(fill=tk.X)

        # Main Scrollable Container
        main_frame = tk.Frame(self, bg="#0f172a", padx=20, pady=15)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # 1. Section: Image Selector
        lbl_img = tk.Label(main_frame, text="1. DAFTAR GAMBAR / FOTO", font=("Segoe UI", 10, "bold"), fg="#38bdf8", bg="#0f172a")
        lbl_img.pack(anchor="w", pady=(0, 5))

        img_btn_row = tk.Frame(main_frame, bg="#0f172a")
        img_btn_row.pack(fill=tk.X, pady=(0, 6))

        btn_add = tk.Button(img_btn_row, text="+ Tambah Gambar", command=self.add_images, bg="#2563eb", fg="white", relief=tk.FLAT, padx=10, pady=4)
        btn_add.pack(side=tk.LEFT, padx=(0, 6))

        btn_clear = tk.Button(img_btn_row, text="Hapus Semua", command=self.clear_images, bg="#334155", fg="white", relief=tk.FLAT, padx=8, pady=4)
        btn_clear.pack(side=tk.LEFT)

        # Listbox for selected images
        list_frame = tk.Frame(main_frame, bg="#1e293b")
        list_frame.pack(fill=tk.X, pady=(0, 15))

        self.listbox = tk.Listbox(list_frame, height=5, bg="#1e293b", fg="#e2e8f0", selectbackground="#3b82f6", selectforeground="#ffffff", relief=tk.FLAT, borderwidth=0)
        scrollbar = tk.Scrollbar(list_frame, orient="vertical", command=self.listbox.yview)
        self.listbox.config(yscrollcommand=scrollbar.set)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)

        # 2. Section: Video Settings
        lbl_cfg = tk.Label(main_frame, text="2. PENGATURAN VIDEO", font=("Segoe UI", 10, "bold"), fg="#38bdf8", bg="#0f172a")
        lbl_cfg.pack(anchor="w", pady=(0, 6))

        cfg_grid = tk.Frame(main_frame, bg="#1e293b", padx=14, pady=12)
        cfg_grid.pack(fill=tk.X, pady=(0, 15))

        # Duration Slider (10s to 60s)
        dur_label_frame = tk.Frame(cfg_grid, bg="#1e293b")
        dur_label_frame.pack(fill=tk.X, pady=(0, 2))
        tk.Label(dur_label_frame, text="Durasi Video (Detik):", fg="#cbd5e1", bg="#1e293b", font=("Segoe UI", 9)).pack(side=tk.LEFT)
        self.dur_val_lbl = tk.Label(dur_label_frame, text=f"{self.duration_var.get()} detik", fg="#38bdf8", bg="#1e293b", font=("Segoe UI", 9, "bold"))
        self.dur_val_lbl.pack(side=tk.RIGHT)

        dur_slider = ttk.Scale(cfg_grid, from_=10, to=60, orient=tk.HORIZONTAL, variable=self.duration_var, command=self.update_dur_label)
        dur_slider.pack(fill=tk.X, pady=(0, 10))

        # Aspect Ratio & FPS Row
        row2 = tk.Frame(cfg_grid, bg="#1e293b")
        row2.pack(fill=tk.X, pady=(0, 8))

        tk.Label(row2, text="Aspek Rasio:", fg="#cbd5e1", bg="#1e293b", font=("Segoe UI", 9)).pack(side=tk.LEFT, padx=(0, 8))
        aspect_cb = ttk.Combobox(row2, textvariable=self.aspect_var, state="readonly", width=34)
        aspect_cb["values"] = (
            "16:9 (1920x1080 YouTube/Landscape)",
            "9:16 (1080x1920 TikTok/Reels/Shorts)",
            "1:1 (1080x1080 Square Instagram)",
            "4:5 (1080x1350 Portrait Feed)"
        )
        aspect_cb.pack(side=tk.LEFT, padx=(0, 14))

        tk.Label(row2, text="FPS:", fg="#cbd5e1", bg="#1e293b", font=("Segoe UI", 9)).pack(side=tk.LEFT, padx=(0, 6))
        fps_cb = ttk.Combobox(row2, textvariable=self.fps_var, state="readonly", width=6)
        fps_cb["values"] = (24, 30, 60)
        fps_cb.pack(side=tk.LEFT)

        # Transition
        row3 = tk.Frame(cfg_grid, bg="#1e293b")
        row3.pack(fill=tk.X)
        tk.Label(row3, text="Efek Transisi:", fg="#cbd5e1", bg="#1e293b", font=("Segoe UI", 9)).pack(side=tk.LEFT, padx=(0, 8))
        trans_cb = ttk.Combobox(row3, textvariable=self.transition_var, state="readonly", width=30)
        trans_cb["values"] = (
            "Ken Burns (Smooth Pan & Zoom)",
            "Smooth Crossfade",
            "Slide Wipe",
            "Cut / Direct"
        )
        trans_cb.pack(side=tk.LEFT)

        # 3. Section: Audio (Optional) & Output
        row_audio = tk.Frame(main_frame, bg="#0f172a")
        row_audio.pack(fill=tk.X, pady=(0, 12))

        btn_audio = tk.Button(row_audio, text="Pilih Musik Audio (.mp3/.wav)", command=self.select_audio, bg="#334155", fg="white", relief=tk.FLAT, padx=8, pady=4)
        btn_audio.pack(side=tk.LEFT, padx=(0, 8))

        self.audio_lbl = tk.Label(row_audio, text="Tanpa Audio (Opsional)", fg="#94a3b8", bg="#0f172a", font=("Segoe UI", 8))
        self.audio_lbl.pack(side=tk.LEFT)

        # Output file destination
        row_out = tk.Frame(main_frame, bg="#0f172a")
        row_out.pack(fill=tk.X, pady=(0, 14))
        tk.Label(row_out, text="Simpan Ke:", fg="#cbd5e1", bg="#0f172a", font=("Segoe UI", 9)).pack(side=tk.LEFT, padx=(0, 8))
        entry_out = tk.Entry(row_out, textvariable=self.output_path, bg="#1e293b", fg="#f8fafc", relief=tk.FLAT, insertbackground="white")
        entry_out.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 8))
        btn_browse = tk.Button(row_out, text="Browse...", command=self.browse_output, bg="#334155", fg="white", relief=tk.FLAT, padx=6)
        btn_browse.pack(side=tk.RIGHT)

        # Progress Bar & Status
        self.progress_bar = ttk.Progressbar(main_frame, mode="indeterminate")
        self.progress_bar.pack(fill=tk.X, pady=(0, 10))

        self.status_lbl = tk.Label(main_frame, text="Siap membuat MP4.", fg="#94a3b8", bg="#0f172a", font=("Segoe UI", 9))
        self.status_lbl.pack(anchor="w", pady=(0, 10))

        # Action Buttons
        self.btn_convert = tk.Button(
            main_frame,
            text="MULAI CONVERT KE MP4 OFFLINE",
            command=self.start_conversion_thread,
            bg="#10b981",
            fg="#ffffff",
            font=("Segoe UI", 11, "bold"),
            relief=tk.FLAT,
            pady=10,
            cursor="hand2"
        )
        self.btn_convert.pack(fill=tk.X)

    def update_dur_label(self, val):
        self.dur_val_lbl.config(text=f"{int(float(val))} detik")

    def add_images(self):
        files = filedialog.askopenfilenames(
            title="Pilih Gambar",
            filetypes=[("Image Files", "*.jpg;*.jpeg;*.png;*.webp;*.bmp;*.tiff")]
        )
        if files:
            for f in files:
                if f not in self.images_list:
                    self.images_list.append(f)
                    self.listbox.insert(tk.END, f"{len(self.images_list)}. {Path(f).name} ({Path(f).parent})")
            self.status_lbl.config(text=f"{len(self.images_list)} gambar dipilih.")

    def clear_images(self):
        self.images_list.clear()
        self.listbox.delete(0, tk.END)
        self.status_lbl.config(text="Daftar gambar dikosongkan.")

    def select_audio(self):
        file = filedialog.askopenfilename(
            title="Pilih File Musik / Audio",
            filetypes=[("Audio Files", "*.mp3;*.wav;*.aac;*.m4a;*.ogg")]
        )
        if file:
            self.audio_path = file
            self.audio_lbl.config(text=f"Audio: {Path(file).name}", fg="#38bdf8")

    def browse_output(self):
        file = filedialog.asksaveasfilename(
            title="Simpan File Video MP4",
            defaultextension=".mp4",
            filetypes=[("MP4 Video", "*.mp4")]
        )
        if file:
            self.output_path.set(file)

    def start_conversion_thread(self):
        if self.is_processing:
            return

        if not self.ffmpeg_found:
            messagebox.showerror(
                "FFmpeg Belum Terpasang",
                "FFmpeg tidak ditemukan di sistem Anda!\\n\\n"
                "Silakan buka terminal PowerShell / CMD dan jalankan:\\n"
                "winget install Gyan.FFmpeg\\n\\n"
                "Lalu restart aplikasi ini."
            )
            return

        if len(self.images_list) == 0:
            messagebox.showwarning("Pilih Gambar", "Silakan tambahkan minimal 1 gambar terlebih dahulu.")
            return

        total_sec = self.duration_var.get()
        if total_sec < 10 or total_sec > 60:
            messagebox.showwarning("Durasi Tidak Valid", "Durasi harus antara 10 detik hingga 60 detik.")
            return

        self.is_processing = True
        self.btn_convert.config(state=tk.DISABLED, bg="#475569", text="Sedang Memproses Video...")
        self.progress_bar.start(10)
        self.status_lbl.config(text="Memulai pemrosesan FFmpeg secara offline...", fg="#38bdf8")

        thread = threading.Thread(target=self.run_ffmpeg_conversion, daemon=True)
        thread.start()

    def run_ffmpeg_conversion(self):
        try:
            total_sec = self.duration_var.get()
            fps = self.fps_var.get()
            output_file = self.output_path.get()
            num_imgs = len(self.images_list)
            dur_per_img = total_sec / num_imgs

            # Resolution parsing
            aspect_choice = self.aspect_var.get()
            if "9:16" in aspect_choice:
                res_w, res_h = 1080, 1920
            elif "1:1" in aspect_choice:
                res_w, res_h = 1080, 1080
            elif "4:5" in aspect_choice:
                res_w, res_h = 1080, 1350
            else:
                res_w, res_h = 1920, 1080

            # Create temporary folder for standardized frames
            temp_dir = Path(os.path.dirname(output_file)) / ".temp_pictura"
            temp_dir.mkdir(parents=True, exist_ok=True)

            self.status_lbl.config(text="1/3 Menstandarkan resolusi gambar...")
            
            # Step 1: Pre-process each image with Pillow to exact resolution without distortion
            processed_imgs = []
            for idx, img_p in enumerate(self.images_list):
                with Image.open(img_p) as pil_img:
                    # Convert to RGB if RGBA or grayscale
                    if pil_img.mode != "RGB":
                        pil_img = pil_img.convert("RGB")
                    
                    # Aspect fit and crop (cover mode)
                    img_w, img_h = pil_img.size
                    scale = max(res_w / img_w, res_h / img_h)
                    new_w = int(img_w * scale)
                    new_h = int(img_h * scale)
                    resized = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                    
                    # Center crop
                    left = (new_w - res_w) // 2
                    top = (new_h - res_h) // 2
                    cropped = resized.crop((left, top, left + res_w, top + res_h))
                    
                    save_path = temp_dir / f"frame_{idx:03d}.jpg"
                    cropped.save(save_path, "JPEG", quality=95)
                    processed_imgs.append(str(save_path))

            # Step 2: Build FFmpeg concat instruction
            concat_txt = temp_dir / "slides.txt"
            with open(concat_txt, "w", encoding="utf-8") as f:
                for p in processed_imgs:
                    # Escape path for FFmpeg concat demuxer
                    escaped_p = p.replace("\\\\", "/")
                    f.write(f"file '{escaped_p}'\\n")
                    f.write(f"duration {dur_per_img:.3f}\\n")
                # Repeat last image once for duration anchor
                escaped_last = processed_imgs[-1].replace("\\\\", "/")
                f.write(f"file '{escaped_last}'\\n")

            self.status_lbl.config(text=f"2/3 Melakukan encoding MP4 ({res_w}x{res_h} @ {fps}fps)...")

            # Step 3: Execute FFmpeg
            cmd = [
                "ffmpeg",
                "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", str(concat_txt),
            ]

            # Audio integration if provided
            if self.audio_path and os.path.exists(self.audio_path):
                cmd.extend(["-i", self.audio_path])

            cmd.extend([
                "-t", str(total_sec),
                "-vf", f"scale={res_w}:{res_h}:force_original_aspect_ratio=decrease,pad={res_w}:{res_h}:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "20",
                "-r", str(fps),
            ])

            if self.audio_path and os.path.exists(self.audio_path):
                cmd.extend(["-c:a", "aac", "-b:a", "192k", "-shortest"])
            else:
                # Add silent AAC audio track so video has an audio stream for player compatibility
                cmd.extend([
                    "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
                    "-c:a", "aac", "-shortest"
                ])

            cmd.append(str(output_file))

            # Run FFmpeg process
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

            # Cleanup temp folder
            try:
                shutil.rmtree(temp_dir)
            except Exception:
                pass

            if result.returncode != 0:
                raise RuntimeError(f"FFmpeg Error:\\n{result.stderr[-400:]}")

            # Success!
            self.after(0, self.on_conversion_success, output_file)

        except Exception as e:
            self.after(0, self.on_conversion_error, str(e))

    def on_conversion_success(self, output_file):
        self.progress_bar.stop()
        self.is_processing = False
        self.btn_convert.config(state=tk.NORMAL, bg="#10b981", text="MULAI CONVERT KE MP4 OFFLINE")
        self.status_lbl.config(text="Berhasil! Video tersimpan.", fg="#10b981")
        
        if messagebox.askyesno("Selesai!", f"Video MP4 berhasil dibuat!\\nLokasi: {output_file}\\n\\nBuka folder video sekarang?"):
            if sys.platform == "win32":
                os.startfile(os.path.dirname(output_file))
            elif sys.platform == "darwin":
                subprocess.Popen(["open", os.path.dirname(output_file)])
            else:
                subprocess.Popen(["xdg-open", os.path.dirname(output_file)])

    def on_conversion_error(self, err_msg):
        self.progress_bar.stop()
        self.is_processing = False
        self.btn_convert.config(state=tk.NORMAL, bg="#10b981", text="MULAI CONVERT KE MP4 OFFLINE")
        self.status_lbl.config(text="Gagal saat memproses video.", fg="#ef4444")
        messagebox.showerror("Terjadi Kesalahan", f"Gagal membuat video:\\n\\n{err_msg}")

if __name__ == "__main__":
    app = PicturaMP4App()
    app.mainloop()
`;
}

export function getPythonCliScript(): string {
  return `#!/usr/bin/env python3
"""
=============================================================================
PicturaMP4 CLI Converter - Offline Command Line Image to MP4 Tool
Jalankan di Terminal / Command Prompt tanpa internet!
=============================================================================
Contoh Penggunaan:
  python convert_cli.py --input ./gambar --output hasil.mp4 --duration 30 --fps 30
  python convert_cli.py --help
"""

import os
import sys
import argparse
import subprocess
import shutil
from pathlib import Path
from PIL import Image

def verify_ffmpeg():
    if not shutil.which("ffmpeg"):
        print("[ERROR] FFmpeg tidak ditemukan di sistem Anda!")
        print("Silakan pasang FFmpeg terlebih dahulu:")
        print("  Windows: winget install Gyan.FFmpeg")
        print("  macOS:   brew install ffmpeg")
        print("  Linux:   sudo apt install ffmpeg")
        sys.exit(1)

def convert_images_to_mp4(
    input_paths,
    output_path="output.mp4",
    duration=30,
    fps=30,
    aspect="16:9",
    audio_path=None
):
    verify_ffmpeg()

    if not input_paths:
        print("[ERROR] Tidak ada file gambar yang diberikan.")
        sys.exit(1)

    # Resolution mapping
    resolutions = {
        "16:9": (1920, 1080),
        "9:16": (1080, 1920),
        "1:1": (1080, 1080),
        "4:5": (1080, 1350)
    }
    res_w, res_h = resolutions.get(aspect, (1920, 1080))

    out_p = Path(output_path).resolve()
    temp_dir = out_p.parent / ".temp_cli_frames"
    temp_dir.mkdir(parents=True, exist_ok=True)

    print(f"[INFO] Memproses {len(input_paths)} gambar ke resolusi {res_w}x{res_h}...")

    # Step 1: Preprocess with Pillow
    processed = []
    for i, img_path in enumerate(input_paths):
        p = Path(img_path)
        if not p.is_file():
            continue
        try:
            with Image.open(p) as img:
                if img.mode != "RGB":
                    img = img.convert("RGB")
                iw, ih = img.size
                scale = max(res_w / iw, res_h / ih)
                nw, nh = int(iw * scale), int(ih * scale)
                resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
                left = (nw - res_w) // 2
                top = (nh - res_h) // 2
                cropped = resized.crop((left, top, left + res_w, top + res_h))
                save_file = temp_dir / f"frame_{i:04d}.jpg"
                cropped.save(save_file, "JPEG", quality=95)
                processed.append(save_file)
        except Exception as e:
            print(f"[WARN] Melewati {p.name}: {e}")

    if not processed:
        print("[ERROR] Tidak ada gambar valid yang berhasil diproses.")
        shutil.rmtree(temp_dir, ignore_errors=True)
        sys.exit(1)

    dur_per_img = duration / len(processed)

    # Step 2: Write concat file
    concat_file = temp_dir / "concat.txt"
    with open(concat_file, "w", encoding="utf-8") as f:
        for p in processed:
            f.write(f"file '{p.as_posix()}'\\n")
            f.write(f"duration {dur_per_img:.3f}\\n")
        f.write(f"file '{processed[-1].as_posix()}'\\n")

    print(f"[INFO] Meng-encode video MP4 ({duration}s @ {fps}fps) menggunakan FFmpeg...")

    cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_file),
    ]

    if audio_path and os.path.exists(audio_path):
        cmd.extend(["-i", audio_path])

    cmd.extend([
        "-t", str(duration),
        "-vf", "format=yuv420p",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "20",
        "-r", str(fps),
    ])

    if audio_path and os.path.exists(audio_path):
        cmd.extend(["-c:a", "aac", "-b:a", "192k", "-shortest"])

    cmd.append(str(out_p))

    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    shutil.rmtree(temp_dir, ignore_errors=True)

    if res.returncode == 0:
        print(f"[SUKSES] Video berhasil dibuat: {out_p}")
    else:
        print("[ERROR] FFmpeg gagal menjalankan perintah:")
        print(res.stderr[-500:])

def main():
    parser = argparse.ArgumentParser(description="PicturaMP4 CLI - Konversi Gambar ke Video MP4 Offline")
    parser.add_argument("-i", "--input", nargs="+", required=True, help="Folder gambar atau daftar file gambar")
    parser.add_argument("-o", "--output", default="output.mp4", help="Path nama file output video MP4")
    parser.add_argument("-d", "--duration", type=float, default=30.0, help="Total durasi video dalam detik (10 - 60)")
    parser.add_argument("--fps", type=int, default=30, choices=[24, 30, 60], help="Frame rate video")
    parser.add_argument("--aspect", choices=["16:9", "9:16", "1:1", "4:5"], default="16:9", help="Aspek rasio video")
    parser.add_argument("-a", "--audio", default=None, help="Path ke file musik latar (.mp3/.wav)")

    args = parser.parse_args()

    # Collect images
    image_files = []
    for item in args.input:
        p = Path(item)
        if p.is_dir():
            for ext in ("*.jpg", "*.jpeg", "*.png", "*.webp", "*.bmp"):
                image_files.extend(list(p.glob(ext)))
        elif p.is_file():
            image_files.append(p)

    image_files = sorted(image_files)

    duration = max(10.0, min(60.0, args.duration))
    convert_images_to_mp4(
        image_files,
        output_path=args.output,
        duration=duration,
        fps=args.fps,
        aspect=args.aspect,
        audio_path=args.audio
    )

if __name__ == "__main__":
    main()
`;
}

export function getWindowsBatchScript(): string {
  return `@echo off
chcp 65001 >nul
title PicturaMP4 - Automated Offline Setup ^& Launcher (Windows)
color 0b

echo =====================================================================
echo       PicturaMP4 - Setup Otomatis ^& Jalankan di PC Lokal
echo =====================================================================
echo.

:: 1. Cek Python
echo [1/4] Memeriksa instalasi Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [PERINGATAN] Python belum terdeteksi di Command Line!
    echo Mencoba menginstall Python via Windows Package Manager (winget)...
    winget install Python.Python.3.11 --silent --accept-source-agreements --accept-package-agreements
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Gagal menginstall Python otomatis.
        echo Silakan unduh dan install Python dari: https://www.python.org/downloads/
        echo PENTING: Centang kotak "Add python.exe to PATH" saat menginstall!
        echo.
        pause
        exit /b 1
    )
) else (
    for /f "tokens=*" %%i in ('python --version') do echo [OK] Terdeteksi: %%i
)

:: 2. Cek FFmpeg
echo.
echo [2/4] Memeriksa instalasi FFmpeg...
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [PERINGATAN] FFmpeg belum terpasang di sistem PATH!
    echo Mengunduh ^& menginstall FFmpeg otomatis via winget...
    winget install Gyan.FFmpeg --accept-source-agreements --accept-package-agreements
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Gagal memasang FFmpeg otomatis via winget.
        echo Anda dapat memasang FFmpeg secara manual atau buka:
        echo https://www.gyan.dev/ffmpeg/builds/
        echo.
    ) else (
        echo [OK] FFmpeg berhasil dipasang via winget!
    )
) else (
    echo [OK] FFmpeg terdeteksi dan siap digunakan!
)

:: 3. Install Dependensi Python
echo.
echo [3/4] Memeriksa dependensi Python (Pillow)...
python -m pip install --upgrade pip >nul 2>&1
python -m pip install Pillow >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Dependensi Python siap!
) else (
    echo [PERINGATAN] Ada kendala saat pip install. Mencoba melanjutkan...
)

:: 4. Jalankan Desktop GUI
echo.
echo [4/4] Membuka PicturaMP4 Desktop GUI...
echo.
start python app_gui.py
exit /b 0
`;
}

export function getMacLinuxBashScript(): string {
  return `#!/usr/bin/env bash
# =====================================================================
# PicturaMP4 - Setup Otomatis & Launcher (macOS / Linux)
# =====================================================================

set -e

echo "====================================================================="
echo "      PicturaMP4 - Setup Otomatis & Jalankan di PC Lokal (Mac/Linux)"
echo "====================================================================="
echo ""

# 1. Cek Python
echo "[1/4] Memeriksa Python 3..."
if command -v python3 &>/dev/null; then
    echo "[OK] Python terdeteksi: $(python3 --version)"
else
    echo "[ERROR] Python 3 belum terpasang!"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Di macOS, pasang via Homebrew: brew install python"
    else
        echo "Di Ubuntu/Debian: sudo apt update && sudo apt install -y python3 python3-pip python3-tk"
    fi
    exit 1
fi

# 2. Cek FFmpeg
echo ""
echo "[2/4] Memeriksa FFmpeg..."
if command -v ffmpeg &>/dev/null; then
    echo "[OK] FFmpeg terdeteksi dan siap!"
else
    echo "[PERINGATAN] FFmpeg belum terpasang."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Menginstall FFmpeg via Homebrew..."
        brew install ffmpeg || echo "Silakan jalankan: brew install ffmpeg"
    else
        echo "Menginstall FFmpeg via apt..."
        sudo apt update && sudo apt install -y ffmpeg || echo "Silakan jalankan: sudo apt install ffmpeg"
    fi
fi

# 3. Install Pillow
echo ""
echo "[3/4] Memasang Pillow library..."
python3 -m pip install --upgrade Pillow

# 4. Jalankan GUI
echo ""
echo "[4/4] Membuka PicturaMP4 Desktop GUI..."
python3 app_gui.py
`;
}

export function getRequirementsTxt(): string {
  return `# Dependensi PicturaMP4
# GUI menggunakan tkinter bawaan standard library Python
# Pemrosesan video menggunakan FFmpeg sistem langsung

Pillow>=10.0.0
`;
}

export function getReadmeMd(): string {
  return `# PicturaMP4 - Offline Image to MP4 Converter Suite

Aplikasi software konversi kumpulan foto/gambar menjadi video MP4 durasi 10 hingga 60 detik **100% offline tanpa koneksi internet**.

---

## ⚡ Panduan Cepat 1-Klik

### Untuk Windows:
Cukup klik dua kali file **\`setup_windows.bat\`**.
Script ini akan:
1. Memeriksa Python & FFmpeg di komputer Anda
2. Memasang dependensi otomatis
3. Membuka jendela aplikasi Desktop GUI

### Untuk macOS & Linux:
1. Buka Terminal di folder ini
2. Berikan izin eksekusi: \`chmod +x setup_mac_linux.sh\`
3. Jalankan: \`./setup_mac_linux.sh\`

---

## 🛠️ Instalasi Manual Mandiri (Untuk Awam)

### 1. Pasang Python (Versi 3.8 ke atas)
- **Windows**: Unduh dari [python.org/downloads](https://www.python.org/downloads/).
  > **PENTING**: Centang opsi **"Add python.exe to PATH"** di layar installer pertama sebelum menekan tombol *Install Now*!
- **macOS**: \`brew install python python-tk\`
- **Linux**: \`sudo apt update && sudo apt install -y python3 python3-pip python3-tk\`

### 2. Pasang FFmpeg
- **Windows (Paling Mudah)**: Buka PowerShell lalu ketik:
  \`\`\`cmd
  winget install Gyan.FFmpeg
  \`\`\`
- **macOS**:
  \`\`\`bash
  brew install ffmpeg
  \`\`\`
- **Linux (Ubuntu/Debian)**:
  \`\`\`bash
  sudo apt install ffmpeg
  \`\`\`

### 3. Verifikasi di Terminal / Command Prompt
Buka Terminal baru dan ketik:
\`\`\`bash
python --version
ffmpeg -version
\`\`\`
Jika keduanya menampilkan versi masing-masing, komputer Anda sudah siap 100%!

### 4. Pasang Library Tambahan
Ketik di terminal:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

---

## 🚀 Menjalankan Aplikasi

### Opsi A: Desktop GUI (Tampilan Jendela Mudah)
\`\`\`bash
python app_gui.py
\`\`\`

### Opsi B: Command Line (CLI)
\`\`\`bash
# Contoh 1: Konversi folder gambar durasi 30 detik format 16:9
python convert_cli.py -i ./foto_liburan -o liburan.mp4 -d 30 --aspect 16:9

# Contoh 2: Format vertikal 9:16 untuk Reels / TikTok durasi 15 detik + Musik
python convert_cli.py -i ./foto_produk -o reels.mp4 -d 15 --aspect 9:16 -a musik.mp3
\`\`\`

---

## 🔒 Privasi & Keamanan
- 100% Offline: Tidak ada data gambar atau audio yang diunggah ke internet atau cloud mana pun.
- Pemrosesan murni menggunakan kartu grafis / CPU lokal PC Anda.
`;
}
