'use client';

import { useState, useRef, useEffect } from 'react';
import type { VerificationResult, UsageStats } from '@/lib/olv/types';

type AppState = 'idle' | 'uploading' | 'processing' | 'results' | 'error';

export default function VerificationDashboard() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch usage on load
  useEffect(() => {
    fetch('/api/olv/usage')
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsage(data.data);
      });
  }, [appState]); // re-fetch usage when app state changes (e.g., after processing)

  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMsg('Only PDF files are supported.');
      setAppState('error');
      return;
    }
    
    // 15MB limit
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 15MB limit.');
      setAppState('error');
      return;
    }

    setFileName(file.name);
    setAppState('uploading');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Small artificial delay for visual feedback
      await new Promise(r => setTimeout(r, 800));
      setAppState('processing');

      const res = await fetch('/api/olv/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process document');
      }

      setResult(data.data);
      setAppState('results');
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during analysis.');
      setAppState('error');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const reset = () => {
    setAppState('idle');
    setResult(null);
    setFileName('');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto font-body">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Offer Letter Verification</h1>
          <p className="text-gray-600 mt-1">Assess candidate offer letters for potential inconsistencies.</p>
        </div>
        
        {usage && (
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex flex-col items-end">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">This Month</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-bold text-[var(--color-accent)]">{usage.used}</span>
              <span className="text-sm text-gray-500">/ {usage.limit} verifications</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Area */}
      {appState === 'idle' && (
        <div className="max-w-2xl mx-auto">
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              dragOver ? 'border-teal-500 bg-teal-50' : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="application/pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]);
              }}
            />
            
            <div className="w-16 h-16 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            
            <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">Upload an offer letter</h3>
            <p className="text-gray-500 mb-6">Drop a PDF here or browse from your computer.</p>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary px-6 py-3"
            >
              Select PDF File
            </button>
            <p className="text-xs text-gray-400 mt-6">Maximum file size: 15MB. Supported format: PDF only.</p>
          </div>

          <div className="mt-8 text-center bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Your document stays private.
            </h4>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              The uploaded offer letter is processed for verification and is not permanently stored. We only retain verification outcomes to operate the service.
            </p>
          </div>
        </div>
      )}

      {(appState === 'uploading' || appState === 'processing') && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <svg className="animate-spin text-gray-200 w-full h-full" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
            </svg>
            <svg className="animate-spin text-[var(--color-accent)] w-full h-full absolute top-0 left-0" viewBox="0 0 24 24" fill="none" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path>
            </svg>
          </div>
          
          <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
            {appState === 'uploading' ? 'Uploading document...' : 'Analyzing document...'}
          </h3>
          <p className="text-gray-500 mb-8">{fileName}</p>
          
          <div className="space-y-4 max-w-sm mx-auto text-left">
            <div className={`flex items-center gap-3 \${appState === 'processing' ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full \${appState === 'processing' ? 'bg-teal-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-sm font-medium">Extracting information</span>
            </div>
            <div className={`flex items-center gap-3 \${appState === 'processing' ? 'text-gray-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full \${appState === 'processing' ? 'bg-gray-400' : 'bg-gray-300'}`}></div>
              <span className="text-sm font-medium">Checking consistency</span>
            </div>
            <div className={`flex items-center gap-3 \${appState === 'processing' ? 'text-gray-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full \${appState === 'processing' ? 'bg-gray-400' : 'bg-gray-300'}`}></div>
              <span className="text-sm font-medium">Identifying risk signals</span>
            </div>
          </div>
        </div>
      )}

      {appState === 'error' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-red-200 p-10 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="text-xl font-heading font-semibold text-gray-900 mb-3">Verification Failed</h3>
          <p className="text-gray-600 mb-8">{errorMsg}</p>
          <button onClick={reset} className="btn-primary px-6 py-2">Try Again</button>
        </div>
      )}

      {appState === 'results' && result && (
        <div className="space-y-8 animate-fade-in-up">
          
          {/* Top Result Banner */}
          <div className={`rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 border \${
            result.overallAssessment === 'low_risk' ? 'bg-green-50 border-green-200' :
            result.overallAssessment === 'review_recommended' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-5">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 \${
                result.overallAssessment === 'low_risk' ? 'bg-green-100 text-green-600' :
                result.overallAssessment === 'review_recommended' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {result.overallAssessment === 'low_risk' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                ) : result.overallAssessment === 'review_recommended' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-1">
                  {result.overallAssessment === 'low_risk' ? 'Low Risk' :
                   result.overallAssessment === 'review_recommended' ? 'Review Recommended' :
                   'High Risk'}
                </h2>
                <p className="text-gray-700">
                  {result.overallAssessment === 'low_risk' ? 'No significant inconsistencies were identified in the document.' :
                   result.overallAssessment === 'review_recommended' ? 'Some signals require additional HR verification.' :
                   'Multiple significant inconsistencies or suspicious signals were identified.'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center bg-white/60 backdrop-blur px-6 py-4 rounded-xl border border-black/5">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Risk Score</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-bold font-heading \${
                  result.riskScore < 26 ? 'text-green-600' :
                  result.riskScore < 61 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{result.riskScore}</span>
                <span className="text-gray-400 font-medium">/100</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Left Column: Summary & Actions */}
            <div className="md:col-span-2 space-y-8">
              <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">Executive Summary</h3>
                <div className="prose prose-sm text-gray-600 whitespace-pre-wrap">
                  {result.executiveSummary}
                </div>
              </section>

              {result.recommendedActions.length > 0 && (
                <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">What should HR do next?</h3>
                  <div className="space-y-4">
                    {result.recommendedActions.map((action, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="mt-1">
                          {action.priority === 'immediate' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                          ) : action.priority === 'standard' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-teal-500" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{action.action}</p>
                          <p className="text-sm text-gray-500 mt-1">{action.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {result.riskIndicators.length > 0 && (
                <section>
                  <h3 className="text-xl font-heading font-semibold text-gray-900 mb-4">Potential Risk Indicators</h3>
                  <div className="space-y-4">
                    {result.riskIndicators.map((indicator, i) => (
                      <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                          <h4 className="font-semibold text-gray-900">{indicator.title}</h4>
                          <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider \${
                            indicator.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            indicator.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                            indicator.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {indicator.severity} risk
                          </span>
                        </div>
                        <div className="p-5">
                          <p className="text-gray-700 mb-4">{indicator.explanation}</p>
                          
                          <div className="bg-gray-50 rounded p-3 mb-4 text-sm border border-gray-100">
                            <span className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Document Evidence:</span>
                            <span className="text-gray-700 italic">"{indicator.evidence}"</span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="block font-semibold text-gray-900 mb-1">Why this matters</span>
                              <p className="text-gray-600">{indicator.whyItMatters}</p>
                            </div>
                            <div>
                              <span className="block font-semibold text-gray-900 mb-1">Recommended action</span>
                              <p className="text-gray-600">{indicator.recommendedAction}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {result.positiveSignals.length > 0 && (
                <section>
                  <h3 className="text-xl font-heading font-semibold text-gray-900 mb-4">Positive Signals</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {result.positiveSignals.map((signal, i) => (
                      <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-500 flex-shrink-0 mt-0.5" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        <div>
                          <h4 className="font-medium text-green-900 text-sm mb-1">{signal.title}</h4>
                          <p className="text-xs text-green-700">{signal.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Extracted Info & Breakdown */}
            <div className="space-y-6">
              
              <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Signal Breakdown</h3>
                <div className="space-y-3">
                  {result.signalBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item.category}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded \${
                        item.assessment === 'good' ? 'bg-green-100 text-green-700' :
                        item.assessment === 'review' ? 'bg-yellow-100 text-yellow-700' :
                        item.assessment === 'warning' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.assessment}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Extracted Info</h3>
                
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 border-b border-gray-100 pb-1 mb-2">CANDIDATE</h4>
                    <p className="text-sm text-gray-600">{result.extractedInfo.candidate.name || 'Not found'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 border-b border-gray-100 pb-1 mb-2">POSITION</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-500">Title:</span>
                      <span className="text-gray-900 font-medium text-right">{result.extractedInfo.position.jobTitle || '-'}</span>
                      <span className="text-gray-500">Location:</span>
                      <span className="text-gray-900 text-right">{result.extractedInfo.position.location || '-'}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 border-b border-gray-100 pb-1 mb-2">COMPENSATION</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-500">Total CTC:</span>
                      <span className="text-gray-900 font-medium text-right">{result.extractedInfo.compensation.annualCTC || '-'}</span>
                      <span className="text-gray-500">Fixed:</span>
                      <span className="text-gray-900 text-right">{result.extractedInfo.compensation.fixedComponent || '-'}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 border-b border-gray-100 pb-1 mb-2">EMPLOYER</h4>
                    <p className="text-sm font-medium text-gray-900 mb-1">{result.extractedInfo.employer.companyName || 'Not found'}</p>
                    <p className="text-xs text-gray-500">{result.extractedInfo.employer.website}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 border-b border-gray-100 pb-1 mb-2">KEY DATES</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-500">Offer Date:</span>
                      <span className="text-gray-900 text-right">{result.extractedInfo.dates.offerDate || '-'}</span>
                      <span className="text-gray-500">Joining Date:</span>
                      <span className="text-gray-900 font-medium text-right">{result.extractedInfo.dates.joiningDate || '-'}</span>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>

          <div className="mt-10 flex flex-col items-center border-t border-gray-200 pt-8 pb-12">
            <button onClick={reset} className="btn-primary px-8 py-3 mb-4">
              Verify Another Offer Letter
            </button>
            <p className="text-xs text-gray-400 text-center max-w-2xl">
              AI-assisted verification only. This assessment identifies potential inconsistencies and risk indicators but does not establish whether an offer letter is genuine or fraudulent. HR teams should independently verify important employment information before making a hiring decision.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
