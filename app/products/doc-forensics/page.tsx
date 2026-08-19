'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';

/* ── Lightweight inline MD5 (Blueimp algorithm, no deps) ── */
function md5(inputStr: string): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function str2binl(str: string) {
    const bin: number[] = [];
    const mask = (1 << 8) - 1;
    for (let i = 0; i < str.length * 8; i += 8) {
      bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << i % 32;
    }
    return bin;
  }
  function binl2hex(binarray: number[]) {
    const hexTab = '0123456789abcdef';
    let str = '';
    for (let i = 0; i < binarray.length * 4; i++) {
      str +=
        hexTab.charAt((binarray[i >> 2] >> (i % 4 * 8 + 4)) & 0xf) +
        hexTab.charAt((binarray[i >> 2] >> (i % 4 * 8)) & 0xf);
    }
    return str;
  }
  function coreMd5(x: number[], len: number) {
    x[len >> 5] |= 0x80 << len % 32;
    x[(((len + 64) >>> 9) << 4) + 14] = len;
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d;
      a = md5ff(a, b, c, d, x[i], 7, -680876936);
      d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
      b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
      d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
      b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
      d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
      b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
      d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
      b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
      a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
      d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
      b = md5gg(b, c, d, a, x[i], 20, -373897302);
      a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
      d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
      b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
      d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
      b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
      d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
      b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
      a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
      d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
      b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
      d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
      c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
      b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
      d = md5hh(d, a, b, c, x[i], 11, -358537222);
      c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
      b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
      d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
      c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
      b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
      a = md5ii(a, b, c, d, x[i], 6, -198630844);
      d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
      b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
      d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
      b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
      d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
      b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
      d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
      b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
      a = safeAdd(a, olda); b = safeAdd(b, oldb);
      c = safeAdd(c, oldc); d = safeAdd(d, oldd);
    }
    return [a, b, c, d];
  }
  return binl2hex(coreMd5(str2binl(inputStr), inputStr.length * 8));
}

async function md5FromBytes(bytes: Uint8Array): Promise<string> {
  // Convert bytes → binary string then run md5
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return md5(str);
}

async function sha256FromBytes(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function parsePdfDate(raw: string | undefined): { date: string; time: string } {
  if (!raw) return { date: 'N/A', time: 'N/A' };
  let s = raw.trim();
  if (s.startsWith('D:')) s = s.slice(2);
  s = s.replace(/[Z+'][^']*'?$/, '').padEnd(14, '0');
  if (s.length < 14) return { date: 'N/A', time: 'N/A' };
  try {
    const year = s.slice(0, 4), mo = s.slice(4, 6), day = s.slice(6, 8);
    const hh = s.slice(8, 10), mm = s.slice(10, 12), ss = s.slice(12, 14);
    return { date: `${year}-${mo}-${day}`, time: `${hh}:${mm}:${ss}` };
  } catch {
    return { date: 'N/A', time: 'N/A' };
  }
}

interface ForensicsRow {
  key: string;
  value: string;
  kind?: 'hash' | 'safe' | 'warn' | 'danger' | 'normal';
}

interface ForensicsSection {
  name: string;
  icon: string;
  rows: ForensicsRow[];
}

declare global {
  interface Window {
    pdfjsLib: {
      getDocument: (src: { data: Uint8Array }) => { promise: Promise<PDFDocumentProxy> };
      GlobalWorkerOptions: { workerSrc: string };
    };
  }
}

interface PDFDocumentProxy {
  numPages: number;
  getMetadata(): Promise<{
    info: Record<string, string | undefined>;
    metadata: { getAll(): Record<string, string> } | null;
  }>;
  getPage(n: number): Promise<PDFPageProxy>;
}

interface PDFPageProxy {
  getViewport(opts: { scale: number }): { width: number; height: number };
  getOperatorList(): Promise<{ fnArray: number[]; argsArray: unknown[][] }>;
  commonObjs: { _objs: Record<string, { data?: { name?: string; type?: string } }> };
  objs: { _objs: Record<string, { data?: { name?: string } }> };
}

export default function DocForensicsPage() {
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [sections, setSections] = useState<ForensicsSection[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfJsReady, setPdfJsReady] = useState(false);

  const analyzePdf = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error');
      setErrorMsg('Only PDF files are accepted.');
      return;
    }
    setFileName(file.name);
    setStatus('analyzing');
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Each consumer gets its own copy — crypto.subtle.digest and pdf.js
      // both transfer (detach) the underlying ArrayBuffer, so sharing it crashes.
      const [md5Hash, sha256Hash] = await Promise.all([
        md5FromBytes(new Uint8Array(arrayBuffer.slice(0))),
        sha256FromBytes(arrayBuffer.slice(0)),
      ]);

      // Fresh copy for pdf.js so its worker transfer doesn't affect our bytes
      const bytes = new Uint8Array(arrayBuffer.slice(0));

      // Decode raw PDF content to string NOW — before pdf.js detaches the buffer.
      // All pattern matching uses this pre-decoded string.
      const rawFull = new TextDecoder('latin1').decode(bytes);

      // Load with pdf.js
      const pdfjsLib = window.pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const { info } = await pdf.getMetadata();

      const safeGet = (key: string) => {
        const v = info[key];
        return v && String(v).trim() ? String(v).trim() : 'N/A';
      };

      const title = safeGet('Title');
      const subject = safeGet('Subject');
      const keywords = safeGet('Keywords');
      const author = safeGet('Author');
      const creator = safeGet('Creator');
      const producer = safeGet('Producer');
      const trapped = safeGet('Trapped');
      const pdfVersion = safeGet('PDFFormatVersion')
        ? `PDF ${safeGet('PDFFormatVersion')}`
        : 'N/A';

      const createdRaw = info['CreationDate'];
      const modifiedRaw = info['ModDate'];
      const created = parsePdfDate(createdRaw);
      const modified = parsePdfDate(modifiedRaw);

      const numPages = pdf.numPages;

      // Page 1 dimensions
      let pageDims = 'N/A';
      try {
        const page1 = await pdf.getPage(1);
        const vp = page1.getViewport({ scale: 1 });
        const wPt = vp.width.toFixed(0);
        const hPt = vp.height.toFixed(0);
        const wIn = (vp.width / 72).toFixed(1);
        const hIn = (vp.height / 72).toFixed(1);
        pageDims = `${wPt} × ${hPt} pts (${wIn} × ${hIn} in)`;
      } catch { /* skip */ }

      // Fonts — scan first 10 pages max
      const fontNames = new Set<string>();
      let hasJavaScript = false;
      let hasForms = false;
      let hasEmbedded = false;
      let isEncrypted = false;

      // Detect encryption via raw header
      if (/\/Encrypt\b/.test(rawFull.slice(0, 2048))) isEncrypted = true;

      // Scan pages for fonts & JS
      const scanPages = Math.min(numPages, 10);
      for (let p = 1; p <= scanPages; p++) {
        try {
          const page = await pdf.getPage(p);
          const opList = await page.getOperatorList();

          // Font keys from commonObjs
          const objs = page.commonObjs._objs;
          for (const key in objs) {
            const obj = objs[key];
            if (obj?.data?.type === 'Font' && obj.data.name) {
              const name = obj.data.name.replace(/^[A-Z]{6}\+/, '');
              fontNames.add(name);
            }
          }

          // JS detection via operator list raw check
          const fnStr = JSON.stringify(opList.fnArray);
          if (fnStr.includes('90') /* OPS.paintJpegXObject is not JS, but raw text scan better */ ) { /* no-op */ }
        } catch { /* skip page */ }
      }

      // Raw text scan for structural features (using pre-decoded string)
      if (/\/JavaScript\b|\/JS\b/.test(rawFull)) hasJavaScript = true;
      if (/\/AcroForm\b/.test(rawFull)) hasForms = true;
      if (/\/EmbeddedFiles\b/.test(rawFull)) hasEmbedded = true;
      if (/\/Encrypt\b/.test(rawFull)) isEncrypted = true;

      // Also pull fonts from raw PDF stream (fallback for pages we skipped)
      const fontMatches = rawFull.matchAll(/\/BaseFont\s+\/([A-Za-z0-9+_-]+)/g);
      for (const m of fontMatches) {
        const name = m[1].replace(/^[A-Z]{6}\+/, '');
        fontNames.add(name);
      }

      const fontList = fontNames.size > 0 ? [...fontNames].sort().join(', ') : 'N/A';

      const built: ForensicsSection[] = [
        {
          name: 'Document Info',
          icon: '📄',
          rows: [
            { key: 'Title', value: title },
            { key: 'Subject', value: subject },
            { key: 'Keywords', value: keywords },
          ],
        },
        {
          name: 'Authorship & Dates',
          icon: '👤',
          rows: [
            { key: 'Author', value: author },
            { key: 'Created by', value: creator !== 'N/A' ? creator : author },
            { key: 'Created date', value: created.date },
            { key: 'Created time', value: created.time },
            { key: 'Last modified by', value: author },
            { key: 'Last modified date', value: modified.date },
            { key: 'Last modified time', value: modified.time },
          ],
        },
        {
          name: 'Production',
          icon: '⚙️',
          rows: [
            { key: 'Producer', value: producer },
            { key: 'PDF version', value: pdfVersion },
            { key: 'Trapped', value: trapped },
          ],
        },
        {
          name: 'Structure & Content',
          icon: '📐',
          rows: [
            { key: 'Pages', value: String(numPages) },
            { key: 'Page size (page 1)', value: pageDims },
            { key: 'Fonts used', value: fontList },
            {
              key: 'Has forms (AcroForm)',
              value: hasForms ? 'Yes' : 'No',
              kind: hasForms ? 'warn' : 'safe',
            },
          ],
        },
        {
          name: 'Security & Forensics',
          icon: '🔒',
          rows: [
            {
              key: 'Encrypted',
              value: isEncrypted ? 'Yes' : 'No',
              kind: isEncrypted ? 'warn' : 'safe',
            },
            {
              key: 'Contains JavaScript',
              value: hasJavaScript ? 'Yes ⚠️' : 'No',
              kind: hasJavaScript ? 'danger' : 'safe',
            },
            {
              key: 'Embedded files',
              value: hasEmbedded ? 'Yes' : 'No',
              kind: hasEmbedded ? 'warn' : 'safe',
            },
            { key: 'File size', value: formatFileSize(file.size) },
            { key: 'MD5 hash', value: md5Hash, kind: 'hash' },
            { key: 'SHA-256 hash', value: sha256Hash, kind: 'hash' },
          ],
        },
      ];

      setSections(built);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to analyze PDF.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) analyzePdf(e.dataTransfer.files[0]);
  };

  const reset = () => {
    setStatus('idle');
    setSections([]);
    setFileName('');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const rowClass = (kind?: string) => {
    if (kind === 'safe') return 'forensics-safe';
    if (kind === 'warn') return 'forensics-warn';
    if (kind === 'danger') return 'forensics-danger';
    return '';
  };

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onReady={() => setPdfJsReady(true)}
      />

      <div className="tool-page">
        <div className="tool-page-inner" style={{ paddingTop: '6rem' }}>
          <Link href="/products" className="tool-back-link">
            ← Back to Tools
          </Link>

          <header className="tool-page-header">
            <h1>DocForensics</h1>
            <p>
              Upload a PDF to extract detailed metadata — authorship, timestamps, security
              flags, file integrity hashes, and more.
            </p>
          </header>

          {/* Upload */}
          {status === 'idle' && (
            <div className="tool-card">
              <div
                className={`tool-drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <span className="tool-drop-icon">🔍</span>
                <p className="tool-drop-text">
                  <strong>Drop your PDF</strong> here or click to browse
                </p>
                <p className="tool-drop-subtext">Supports PDF files of any size</p>
                <input
                  ref={fileInputRef}
                  id="forensics-file-input"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    if (!pdfJsReady) {
                      setStatus('error');
                      setErrorMsg('PDF engine is still loading, please wait a moment.');
                      return;
                    }
                    if (e.target.files?.[0]) analyzePdf(e.target.files[0]);
                  }}
                />
              </div>
            </div>
          )}

          {/* Analyzing */}
          {status === 'analyzing' && (
            <div className="tool-card">
              <div className="tool-status" style={{ padding: '3rem 1rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔬</div>
                <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Analyzing {fileName}...
                </p>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Extracting metadata, computing hashes, scanning for security flags
                </p>
                <div className="tool-progress-wrap">
                  <div className="tool-progress-bar" style={{ width: '65%' }} />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="tool-card">
              <div className="tool-status error" style={{ padding: '3rem 1rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>❌</div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{errorMsg}</p>
                <button className="tool-btn-secondary" onClick={reset} style={{ marginTop: '1rem' }}>
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {status === 'done' && sections.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'toolFadeIn 0.5s ease-out' }}>
              {/* Report header */}
              <div className="forensics-results-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>📄</span>
                  <span style={{ fontWeight: 700, color: '#f1f5f9' }}>Analysis Report</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="forensics-filename-badge">{fileName}</span>
                  <span className="forensics-complete-badge">✓ Complete</span>
                </div>
              </div>

              {/* Sections */}
              <div className="forensics-results-card">
                {sections.map((section, si) => (
                  <div key={section.name} className={`forensics-section-group ${si === sections.length - 1 ? 'last' : ''}`}>
                    <div className="forensics-section-title">
                      <span>{section.icon}</span>
                      {section.name}
                    </div>
                    <table className="forensics-meta-table">
                      <tbody>
                        {section.rows.map((row) => (
                          <tr key={row.key}>
                            <th>{row.key}</th>
                            <td>
                              {row.kind === 'hash' ? (
                                <span className="forensics-hash-value">{row.value}</span>
                              ) : row.kind === 'safe' ? (
                                <span className="forensics-safe">✓ {row.value}</span>
                              ) : row.kind === 'warn' ? (
                                <span className={rowClass(row.kind)}>🔒 {row.value}</span>
                              ) : row.kind === 'danger' ? (
                                <span className={rowClass(row.kind)}>⚠ {row.value}</span>
                              ) : (
                                row.value
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="tool-btn-secondary" onClick={reset} id="forensics-analyze-another">
                  Analyze Another PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
