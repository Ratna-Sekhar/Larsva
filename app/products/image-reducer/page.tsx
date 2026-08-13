'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

const TOOLS_API = process.env.NEXT_PUBLIC_TOOLS_API_URL || 'http://localhost:8000';

const formats = ['png', 'jpg', 'webp', 'bmp', 'tiff', 'gif'];

export default function ImageReducerPage() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quality, setQuality] = useState('high');
  const [format, setFormat] = useState('png');
  const [originalSize, setOriginalSize] = useState(0);
  const [reducedSize, setReducedSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatus('error');
      setErrorMsg('Please upload an image file.');
      return;
    }
    setSelectedFile(file);
    setOriginalSize(file.size);
    setStatus('idle');
    setErrorMsg('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleReduce = async () => {
    if (!selectedFile) return;
    setStatus('uploading');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('quality', quality);
    formData.append('target_format', format);

    try {
      const res = await fetch(`${TOOLS_API}/image-reducer/reduce`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Reduction failed.');
      }

      const outSize = parseInt(res.headers.get('X-Output-Size') || '0', 10);
      setReducedSize(outSize);

      const blob = await res.blob();
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      const ext = format === 'jpeg' ? 'jpg' : format;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_reduced.${ext}`;
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
    setOriginalSize(0);
    setReducedSize(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const reductionPercent = reducedSize > 0 && originalSize > 0
    ? Math.round(((originalSize - reducedSize) / originalSize) * 100)
    : 0;

  return (
    <div className="tool-page">
      <div className="tool-page-inner" style={{ paddingTop: '6rem' }}>
        <Link href="/products" className="tool-back-link">
          ← Back to Tools
        </Link>

        <header className="tool-page-header">
          <h1>Image Size Reducer</h1>
          <p>Reduce image file size while maintaining excellent visual quality.</p>
        </header>

        <div className="tool-card">
          {/* Upload zone */}
          {!selectedFile && status !== 'error' && (
            <div
              className={`tool-drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <span className="tool-drop-icon">📉</span>
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

          {/* File selected — configure and reduce */}
          {selectedFile && status !== 'done' && status !== 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="tool-file-info">
                <span className="file-icon">🖼️</span>
                <div>
                  <div className="file-name">{selectedFile.name}</div>
                  <div className="file-size">{formatBytes(originalSize)}</div>
                </div>
              </div>

              {/* Quality selection */}
              <div>
                <span className="tool-control-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Quality Level:</span>
                <div className="tool-quality-group">
                  {[
                    { key: 'high', label: 'High', desc: '~10% smaller' },
                    { key: 'med', label: 'Medium', desc: '~40% smaller' },
                    { key: 'low', label: 'Low', desc: '~60% smaller' },
                  ].map((q) => (
                    <button
                      key={q.key}
                      className={`tool-quality-option ${quality === q.key ? 'active' : ''}`}
                      onClick={() => setQuality(q.key)}
                    >
                      <span className="quality-label">{q.label}</span>
                      <span className="quality-desc">{q.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format selection */}
              <div>
                <span className="tool-control-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Output Format:</span>
                <div className="tool-format-grid">
                  {formats.map((f) => (
                    <button
                      key={f}
                      className={`tool-format-btn ${format === f ? 'active' : ''}`}
                      onClick={() => setFormat(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {status === 'uploading' && (
                <div className="tool-progress-wrap">
                  <div className="tool-progress-bar" style={{ width: '70%' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button className="tool-btn-secondary" onClick={reset}>Cancel</button>
                <button
                  className="tool-btn-primary"
                  onClick={handleReduce}
                  disabled={status === 'uploading'}
                >
                  {status === 'uploading' ? '⏳ Reducing...' : '📥 Reduce & Download'}
                </button>
              </div>
            </div>
          )}

          {/* Success */}
          {status === 'done' && (
            <div className="tool-status success" style={{ padding: '3rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
              <p style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                Image reduced and downloaded!
              </p>
              <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                {formatBytes(originalSize)} → {formatBytes(reducedSize)}
                {reductionPercent > 0 && (
                  <span style={{ color: 'var(--color-accent)', fontWeight: 700, marginLeft: '0.5rem' }}>
                    ({reductionPercent}% smaller)
                  </span>
                )}
              </p>
              <button className="tool-btn-primary" onClick={reset}>
                Reduce Another Image
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
