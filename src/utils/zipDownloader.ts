import JSZip from 'jszip';
import {
  getPythonGuiScript,
  getPythonCliScript,
  getWindowsBatchScript,
  getMacLinuxBashScript,
  getRequirementsTxt,
  getReadmeMd,
} from './pythonScripts';
import { VideoConfig } from '../types';

export async function downloadLocalSoftwarePackage(config?: VideoConfig) {
  const zip = new JSZip();

  const guiScript = getPythonGuiScript({
    defaultDuration: config?.durationSeconds || 30,
    defaultFps: config?.fps || 30,
    defaultAspect: config?.aspectRatio || '16:9',
  });

  zip.file('app_gui.py', guiScript);
  zip.file('convert_cli.py', getPythonCliScript());
  zip.file('setup_windows.bat', getWindowsBatchScript());
  zip.file('setup_mac_linux.sh', getMacLinuxBashScript());
  zip.file('requirements.txt', getRequirementsTxt());
  zip.file('README.md', getReadmeMd());

  // Also include a sample images folder if user wants a test
  const sampleFolder = zip.folder('sample_images');
  if (sampleFolder) {
    sampleFolder.file(
      'README_SAMPLE.txt',
      'Masukkan gambar foto Anda (*.jpg, *.png, *.webp) ke dalam folder ini atau pilih folder mana pun di PC Anda saat menjalankan app_gui.py!'
    );
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);

  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'PicturaMP4_Local_PC_Suite.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
}

export function downloadSingleFile(filename: string, content: string, mime: string = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
