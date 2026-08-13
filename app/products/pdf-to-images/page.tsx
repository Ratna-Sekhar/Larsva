'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

const TOOLS_API = process.env.NEXT_PUBLIC_TOOLS_API_URL || 'http://localhost:8000';

interface PageImage {
  url: string;
  name: string;
}

export default function PdfToImagesPage() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [images, setImages] = useState<PageImage[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [fileName, setFileName] = useState('');
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
      const res = await fetch(`${TOOLS_API}/pdf-to-images/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Processing failed.');
      }

      const data = await res.json();
      setSessionId(data.session_id);
      setImages(data.images || []);
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

  const downloadAll = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${TOOLS_API}/pdf-to-images/download-all/${sessionId}`);
      if (!res.ok) throw new Error('Download failed.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pdf_images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed.');
    }
  };

  const downloadSingle = (img: PageImage) => {
    const a = document.createElement('a');
    a.href = `${TOOLS_API}${img.url}`;
    a.download = img.name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setStatus('idle');
    setImages([]);
    setSessionId('');
    setFileName('');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="tool-page">
      <div className="tool-page-inner" style={{ paddingTop: '6rem' }}>
        <Link href="/products" className="tool-back-link">
          ← Back to Tools
        </Link>

        <header className="tool-page-header">
          <h1>PDF to Images</h1>
          <p>Upload a PDF and extract every page as a high-quality PNG image.</p>
        </header>

        <div className="tool-card">
          {/* Upload */}
          {status === 'idle' && (
            <div
              className={`tool-drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <span className="tool-drop-icon">📑</span>
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

          {/* Processing */}
          {status === 'uploading' && (
            <div className="tool-status" style={{ padding: '3rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
              <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '0.5rem' }}>
                Extracting pages from {fileName}...
              </p>
              <div className="tool-progress-wrap">
                <div className="tool-progress-bar" style={{ width: '70%' }} />
              </div>
            </div>
          )}

          {/* Gallery */}
          {status === 'done' && images.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <p style={{ color: '#f1f5f9', fontWeight: 600 }}>
                  {images.length} page{images.length !== 1 ? 's' : ''} extracted
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="tool-btn-secondary" onClick={reset}>
                    Upload Another
                  </button>
                  <button className="tool-btn-primary" onClick={downloadAll}>
                    📥 Download All (.zip)
                  </button>
                </div>
              </div>

              <div className="tool-gallery">
                {images.map((img, i) => (
                  <div
                    key={img.name}
                    className="tool-gallery-item"
                    onClick={() => downloadSingle(img)}
                    title={`Download ${img.name}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${TOOLS_API}${img.url}`}
                      alt={`Page ${i + 1}`}
                      loading="lazy"
                    />
                    <div className="gallery-label">
                      <span>Page {i + 1}</span>
                      <span className="gallery-download">↓ Save</span>
                    </div>
                  </div>
                ))}
              </div>
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
