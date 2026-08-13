'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';

export default function SmartCropPage() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cropperReady, setCropperReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const [originalFileName, setOriginalFileName] = useState('cropped_image');
  const [activeRatio, setActiveRatio] = useState('free');
  const [dragOver, setDragOver] = useState(false);

  const initCropper = useCallback(() => {
    if (!imageRef.current || !window.Cropper) return;
    if (cropperRef.current) cropperRef.current.destroy();

    cropperRef.current = new window.Cropper(imageRef.current, {
      viewMode: 2,
      dragMode: 'crop',
      autoCropArea: 0.8,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: true,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (cropperRef.current) cropperRef.current.destroy();
    };
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    setOriginalFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (e) => {
      if (imageRef.current && e.target?.result) {
        imageRef.current.src = e.target.result as string;
        setImageLoaded(true);
        setTimeout(() => initCropper(), 100);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleRatioClick = (ratioStr: string, ratioVal: number) => {
    setActiveRatio(ratioStr);
    cropperRef.current?.setAspectRatio(ratioVal);
  };

  const handleCustomRatio = (w: number, h: number) => {
    if (w > 0 && h > 0) {
      setActiveRatio('custom');
      cropperRef.current?.setAspectRatio(w / h);
    }
  };

  const handleCancel = () => {
    if (cropperRef.current) {
      cropperRef.current.destroy();
      cropperRef.current = null;
    }
    setImageLoaded(false);
    setActiveRatio('free');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = () => {
    if (!cropperRef.current) return;
    const canvas = cropperRef.current.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });
    if (!canvas) {
      alert('Could not export cropped image.');
      return;
    }
    canvas.toBlob((blob: Blob | null) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${originalFileName}_smartcrop.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const ratios = [
    { label: 'Free', key: 'free', value: NaN },
    { label: '1:1', key: '1:1', value: 1 },
    { label: '16:9', key: '16:9', value: 16 / 9 },
    { label: '4:3', key: '4:3', value: 4 / 3 },
    { label: '3:2', key: '3:2', value: 3 / 2 },
    { label: '9:16', key: '9:16', value: 9 / 16 },
  ];

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js"
        onReady={() => setCropperReady(true)}
      />
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css"
      />

      <div className="tool-page">
        <div className="tool-page-inner" style={{ paddingTop: '6rem' }}>
          <Link href="/products" className="tool-back-link">
            ← Back to Tools
          </Link>

          <header className="tool-page-header">
            <h1>SMART CROP</h1>
            <p>Upload, select an aspect ratio, and dynamically crop images perfectly.</p>
          </header>

          {/* Upload Section */}
          {!imageLoaded && (
            <div className="tool-card">
              <div
                className={`tool-drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <span className="tool-drop-icon">🖼️</span>
                <p className="tool-drop-text">
                  <strong>Drop your image</strong> here or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            </div>
          )}

          {/* Editor Section */}
          {imageLoaded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'toolFadeIn 0.6s ease-out' }}>
              <div className="tool-image-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={imageRef} src="" alt="Image to crop" />
              </div>

              <div className="tool-controls">
                <div className="tool-controls-row">
                  <div className="tool-control-group">
                    <span className="tool-control-label">Aspect Ratio:</span>
                    {ratios.map((r) => (
                      <button
                        key={r.key}
                        className={`tool-btn-ratio ${activeRatio === r.key ? 'active' : ''}`}
                        onClick={() => handleRatioClick(r.key, r.value)}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>

                  <div className="tool-custom-ratio">
                    <span className="tool-control-label">Custom:</span>
                    <input
                      type="number"
                      placeholder="W"
                      min="1"
                      id="customW"
                      onChange={(e) => {
                        const h = (document.getElementById('customH') as HTMLInputElement)?.value;
                        handleCustomRatio(parseFloat(e.target.value), parseFloat(h || '0'));
                      }}
                    />
                    <span style={{ color: '#94a3b8' }}>:</span>
                    <input
                      type="number"
                      placeholder="H"
                      min="1"
                      id="customH"
                      onChange={(e) => {
                        const w = (document.getElementById('customW') as HTMLInputElement)?.value;
                        handleCustomRatio(parseFloat(w || '0'), parseFloat(e.target.value));
                      }}
                    />
                  </div>
                </div>

                <div className="tool-controls-row" style={{ marginTop: '0.5rem' }}>
                  <div className="tool-control-group">
                    <button className="tool-btn-icon" onClick={() => cropperRef.current?.zoom(0.1)} title="Zoom In">🔍+</button>
                    <button className="tool-btn-icon" onClick={() => cropperRef.current?.zoom(-0.1)} title="Zoom Out">🔍-</button>
                    <button className="tool-btn-icon" onClick={() => cropperRef.current?.setDragMode('move')} title="Move Mode">✋</button>
                    <button className="tool-btn-icon" onClick={() => cropperRef.current?.setDragMode('crop')} title="Crop Mode">📐</button>
                    <button className="tool-btn-icon" onClick={() => { cropperRef.current?.reset(); setActiveRatio('free'); }} title="Reset">🔄</button>
                  </div>
                  <div className="tool-control-group">
                    <button className="tool-btn-secondary" onClick={handleCancel}>Cancel</button>
                    <button className="tool-btn-primary" onClick={handleDownload}>📥 Download</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
