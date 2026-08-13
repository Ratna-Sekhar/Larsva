'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

const TOOLS_API = process.env.NEXT_PUBLIC_TOOLS_API_URL || 'http://localhost:8000';

export default function NotebookLMCropPage() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error');
      setErrorMsg('Only PDF files are allowed.');
      return;
    }

    setFileName(file.name);
    setStatus('uploading');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${TOOLS_API}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Processing failed.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cropped_${file.name}`;
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const reset = () => {
    setStatus('idle');
    setErrorMsg('');
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="tool-page">
      <div className="tool-page-inner" style={{ paddingTop: '6rem' }}>
        <Link href="/products" className="tool-back-link">
          ← Back to Tools
        </Link>

        <header className="tool-page-header">
          <h1>NotebookLM Watermark Remover</h1>
          <p>Upload a PDF and automatically crop to a cinematic 16:9 aspect ratio.</p>
        </header>

        <div className="tool-card">
          {status === 'idle' && (
            <div
              className={`tool-drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <span className="tool-drop-icon">📄</span>
              <p className="tool-drop-text">
                <strong>Drop your PDF</strong> here or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          )}

          {status === 'uploading' && (
            <div className="tool-status" style={{ padding: '3rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
              <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '0.5rem' }}>
                Processing {fileName}...
              </p>
              <div className="tool-progress-wrap">
                <div
                  className="tool-progress-bar"
                  style={{ width: '80%', animation: 'shimmer 1.5s infinite linear' }}
                />
              </div>
              <p style={{ fontSize: '0.85rem' }}>Cropping to 16:9 cinematic ratio</p>
            </div>
          )}

          {status === 'done' && (
            <div className="tool-status success" style={{ padding: '3rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
              <p style={{ color: 'var(--color-accent)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                Done! Your cropped PDF has been downloaded.
              </p>
              <button className="tool-btn-primary" onClick={reset} style={{ marginTop: '1rem' }}>
                Process Another PDF
              </button>
            </div>
          )}

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
