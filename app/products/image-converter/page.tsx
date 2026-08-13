'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

const TOOLS_API = process.env.NEXT_PUBLIC_TOOLS_API_URL || 'http://localhost:8000';

const formats = ['png', 'jpg', 'webp', 'bmp', 'tiff', 'ico', 'gif'];

export default function ImageConverterPage() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatus('error');
      setErrorMsg('Please upload an image file.');
      return;
    }
    setSelectedFile(file);
    setStatus('idle');
    setErrorMsg('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setStatus('uploading');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('target_format', targetFormat);

    try {
      const res = await fetch(`${TOOLS_API}/image-converter/convert`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Conversion failed.');
      }

      const blob = await res.blob();
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  const reset = () => {
    setStatus('idle');
    setSelectedFile(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getSourceFormat = () => {
    if (!selectedFile) return '';
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    return ext.toUpperCase();
  };

  return (
    <div className="tool-page">
      <div className="tool-page-inner" style={{ paddingTop: '6rem' }}>
        <Link href="/products" className="tool-back-link">
          ← Back to Tools
        </Link>

        <header className="tool-page-header">
          <h1>Image Converter</h1>
          <p>Convert images between PNG, JPG, WebP, BMP, TIFF, GIF, and ICO formats.</p>
        </header>

        <div className="tool-card">
          {/* Upload */}
          {!selectedFile && status !== 'error' && (
            <div
              className={`tool-drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <span className="tool-drop-icon">🔄</span>
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
          )}

          {/* Configure */}
          {selectedFile && status !== 'done' && status !== 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="tool-file-info">
                <span className="file-icon">🖼️</span>
                <div>
                  <div className="file-name">{selectedFile.name}</div>
                  <div className="file-size">Source: {getSourceFormat()}</div>
                </div>
              </div>

              <div>
                <span className="tool-control-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Convert to:</span>
                <div className="tool-format-grid">
                  {formats.map((f) => (
                    <button
                      key={f}
                      className={`tool-format-btn ${targetFormat === f ? 'active' : ''}`}
                      onClick={() => setTargetFormat(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {status === 'uploading' && (
                <div className="tool-progress-wrap">
                  <div className="tool-progress-bar" style={{ width: '60%' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button className="tool-btn-secondary" onClick={reset}>Cancel</button>
                <button
                  className="tool-btn-primary"
                  onClick={handleConvert}
                  disabled={status === 'uploading'}
                >
                  {status === 'uploading' ? '⏳ Converting...' : `🔄 Convert to ${targetFormat.toUpperCase()}`}
                </button>
              </div>
            </div>
          )}

          {/* Done */}
          {status === 'done' && (
            <div className="tool-status success" style={{ padding: '3rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
              <p style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                Converted and downloaded!
              </p>
              <button className="tool-btn-primary" onClick={reset} style={{ marginTop: '1rem' }}>
                Convert Another Image
              </button>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="tool-status error" style={{ padding: '3rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>❌</div>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{errorMsg}</p>
              <button className="tool-btn-secondary" onClick={reset} style={{ marginTop: '1rem' }}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
