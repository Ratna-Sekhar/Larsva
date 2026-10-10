'use client';

import { useState } from 'react';
import { AnalysisResult } from './types';
import UploadSection from './components/UploadSection';
import ResultsSection from './components/ResultsSection';

export default function HRDocForensicsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState('');

  const handleUpload = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgressMsg('Uploading and extracting metadata...');

    try {
      // Simulate stages for UI (since the backend does it all in one synchronous call)
      const stages = [
        'Reading file & extracting metadata...',
        'Computing forensic signals...',
        'Rendering document pages...',
        'Running AI analysis (this takes a moment)...',
        'Generating verdict and counter-offer insights...'
      ];
      
      let currentStage = 0;
      const interval = setInterval(() => {
        if (currentStage < stages.length - 1) {
          currentStage++;
          setProgressMsg(stages[currentStage]);
        }
      }, 3000);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/hrdocforensics/analyze`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        let errText = 'Analysis failed.';
        try {
          const errData = await response.json();
          errText = errData.detail || errText;
        } catch (e) {}
        throw new Error(errText);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-32 pb-24">
      <div className="container-narrow">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="price-badge mb-4">HR & Talent Teams</span>
          <h1 className="text-4xl md:text-5xl font-bold font-[var(--font-heading)] mb-4 text-[var(--color-navy-950)]">
            HR Document <span className="gradient-text">Forensics</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
            Upload an offer letter, relieving letter, or payslip. Predict authenticity, detect editing anomalies, and generate data-driven counter-offer strategies.
          </p>
        </div>

        {!result && !isLoading && (
          <UploadSection onUpload={handleUpload} />
        )}

        {isLoading && (
          <div className="card-border-gradient mt-8 p-12 text-center animate-fade-in">
            <div className="inline-block relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-[rgba(0,194,168,0.2)] border-t-[var(--color-teal-500)] animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[var(--color-teal-100)] animate-pulse-dot"></div>
              </div>
            </div>
            <h3 className="text-xl font-bold font-[var(--font-heading)] mb-2">Analyzing Document</h3>
            <p className="text-[var(--color-text-muted)]">{progressMsg}</p>
          </div>
        )}

        {error && (
          <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Analysis Error
            </h3>
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-4 text-sm font-semibold underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {result && (
          <ResultsSection result={result} onReset={() => setResult(null)} />
        )}
      </div>
    </div>
  );
}
