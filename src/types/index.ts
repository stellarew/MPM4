export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export type TransitionType = 
  | 'kenburns' 
  | 'crossfade' 
  | 'slide' 
  | 'zoom' 
  | 'fade_black' 
  | 'cut';

export type FitMode = 'cover' | 'contain';

export interface ImageItem {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  durationWeight?: number; // relative weight if customized
  element?: HTMLImageElement;
}

export interface VideoConfig {
  durationSeconds: number; // 10 to 60 seconds
  fps: number; // 24, 30, 60
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  transition: TransitionType;
  transitionDuration: number; // e.g. 0.8s
  fitMode: FitMode;
  overlayText: string;
  overlayPosition: 'bottom' | 'top' | 'center' | 'watermark';
  includeAudio: boolean;
  audioType: 'none' | 'ambient' | 'custom';
  audioFileName?: string;
  audioBuffer?: AudioBuffer | null;
}

export interface RenderProgress {
  status: 'idle' | 'rendering' | 'muxing' | 'completed' | 'error';
  currentFrame: number;
  totalFrames: number;
  percent: number;
  fps: number;
  etaSeconds: number;
  error?: string;
  outputBlobUrl?: string;
  fileSizeMb?: number;
}
