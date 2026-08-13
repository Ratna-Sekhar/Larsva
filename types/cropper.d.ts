/* eslint-disable @typescript-eslint/no-explicit-any */

interface CropperOptions {
  viewMode?: number;
  dragMode?: string;
  autoCropArea?: number;
  restore?: boolean;
  guides?: boolean;
  center?: boolean;
  highlight?: boolean;
  cropBoxMovable?: boolean;
  cropBoxResizable?: boolean;
  toggleDragModeOnDblclick?: boolean;
  aspectRatio?: number;
}

interface CropperCanvas {
  toBlob(callback: (blob: Blob | null) => void, type?: string, quality?: number): void;
}

declare class Cropper {
  constructor(element: HTMLImageElement, options?: CropperOptions);
  destroy(): void;
  getCroppedCanvas(options?: {
    imageSmoothingEnabled?: boolean;
    imageSmoothingQuality?: string;
  }): CropperCanvas;
  setAspectRatio(ratio: number): void;
  setDragMode(mode: string): void;
  zoom(ratio: number): void;
  reset(): void;
}

interface Window {
  Cropper: typeof Cropper;
}
