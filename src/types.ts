export type TabType = 'restaurant' | 'music' | 'image-studio' | 'video-animator' | 'gallery';

export type AspectRatioType = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type VideoAspectRatioType = '16:9' | '9:16';

export interface GalleryItem {
  id: string;
  type: 'image' | 'video' | 'music';
  url: string;
  prompt: string;
  timestamp: number;
  aspectRatio?: string;
  baseImageUrl?: string;
  model?: string;
  title?: string;
  duration?: number;
}

export interface ImageStudioParams {
  prompt: string;
  aspectRatio: AspectRatioType;
  imageSize: '1K' | '2K';
  baseImage?: {
    data: string;
    mimeType: string;
    previewUrl: string;
  } | null;
}

export interface VideoGenerationParams {
  prompt: string;
  aspectRatio: VideoAspectRatioType;
  image: {
    imageBytes: string;
    mimeType: string;
    previewUrl: string;
  };
}
