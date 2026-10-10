'use client';

import { useState } from 'react';
import { AnalysisResult } from '../types';

type Props = {
  result: AnalysisResult;
  onReset: () => void;
};

export default function ResultsSection({ result, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<'verdict' | 'counter' | 'pages' | 'meta'>('verdict');
  const [hashFile1, setHashFile1] = useState<File | null>(null);
  const [hashFile2, setHashFile2] = useState<File | null>(null);
  const [hashResult, setHashResult] = useState<any>(null);
  const [hashLoading, setHashLoading] = useState(false);

  const { verdict, summary, findings, checks_passed, limitations, counter_offer_analysis, metadata, signals } = result;

  const compareHashes = async () => {
    if (!hashFile1 || !hashFile2) return;
    setHashLoading(true);
    const fd = new FormData();
    fd.append('file1', hashFile1);
    fd.append('file2', hashFile2);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/hrdocforensics/compare-hash`, { method: 'POST', body: fd });
      setHashResult(await res.json());
    } catch (e) {
      alert('Failed to compare hashes');
    }
    setHashLoading(false);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    alert('JSON copied to clipboard');
  };

  const downloadPdfReport = () => {
    const reportHtml = `
<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>HRDocForensics Report</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e; }
  h1 { font-size: 24px; border-bottom: 2px solid #00c2a8; padding-bottom: 8px; }
  h2 { font-size: 18px; margin-top: 32px; color: #334155; }
  .score { font-size: 48px; font-weight: bold; text-align: center; margin: 24px 0; }
  .band { text-align: center; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; }
  .finding { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin: 8px 0; }
  .severity { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .high { background: #fee2e2; color: #991b1b; }
  .medium { background: #fef3c7; color: #92400e; }
  .low { background: #f1f5f9; color: #475569; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
  th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
  th { background: #f8fafc; font-weight: 600; }
  .disclaimer { font-size: 11px; color: #94a3b8; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
  @media print { body { padding: 0; } }
</style>
</head><body>
<h1>HRDocForensics — Analysis Report</h1>
<p>Generated: ${new Date().toLocaleString()}</p>

<div class="score" style="color:${verdict.band_colour}">${verdict.authenticity_score.toFixed(1)} / 10</div>
<div class="band" style="color:${verdict.band_colour}">${verdict.band_label}</div>

<h2>Summary</h2>
<p>${summary}</p>

<h2>Recommendation</h2>
<p>${verdict.recommendation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>

<h2>Findings (${findings.length})</h2>
${findings.length === 0 ? '<p><em>No anomalies detected.</em></p>' : findings.map(f => `
<div class="finding">
  <span class="severity ${f.severity}">${f.severity}</span>
  <strong> ${f.title}</strong>
  <p style="margin:4px 0 0;font-size:13px;color:#475569">${f.evidence}</p>
  ${f.innocent_explanation ? `<p style="margin:4px 0 0;font-size:12px;color:#b45309"><em>Note: ${f.innocent_explanation}</em></p>` : ''}
</div>`).join('')}

<h2>Checks Passed</h2>
<ul>${checks_passed.map(c => `<li>${c}</li>`).join('')}</ul>

<h2>Limitations</h2>
<ul>${limitations.map(l => `<li>${l}</li>`).join('')}</ul>

${counter_offer_analysis.status === 'complete' && counter_offer_analysis.factor_comparison ? `
<h2>Factor Comparison</h2>
<table>
<tr><th>Factor</th><th>Current</th><th>New Offer</th><th>Favours</th></tr>
${counter_offer_analysis.factor_comparison.map(f => `<tr><td>${f.factor.replace(/_/g, ' ')}</td><td>${f.current}</td><td>${f.new}</td><td>${f.favours}</td></tr>`).join('')}
</table>` : ''}

<div class="disclaimer">${verdict.disclaimer}</div>
</body></html>`;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.addEventListener('load', () => {
        win.print();
        URL.revokeObjectURL(url);
      });
    }
  };

  return (
    <div className="animate-fade-in-up mt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
          <button 
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'verdict' ? 'bg-[var(--color-navy-900)] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('verdict')}
          >
            Verdict
          </button>
          <button 
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'counter' ? 'bg-[var(--color-navy-900)] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('counter')}
          >
            Counter-Offer
          </button>
          <button 
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'pages' ? 'bg-[var(--color-navy-900)] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('pages')}
          >
            Pages
          </button>
          <button 
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'meta' ? 'bg-[var(--color-navy-900)] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('meta')}
          >
            Evidence (Raw)
          </button>
        </div>
        
        <div className="flex gap-3">
          <button onClick={downloadPdfReport} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            PDF Report
          </button>
          <button onClick={copyJson} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50">
            Copy JSON
          </button>
          <button onClick={onReset} className="px-4 py-2 text-red-600 border border-red-200 bg-red-50 rounded-lg text-sm font-semibold hover:bg-red-100">
            New Analysis
          </button>
        </div>
      </div>

      {/* VERDICT TAB */}
      {activeTab === 'verdict' && (
        <div className="space-y-8">
          {/* Score Card */}
          <div className="card-border-gradient p-8 bg-white">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0 text-center">
                <div 
                  className="w-32 h-32 rounded-full border-[12px] flex items-center justify-center text-4xl font-bold font-[var(--font-heading)]"
                  style={{ borderColor: verdict.band_colour, color: verdict.band_colour }}
                >
                  {verdict.authenticity_score.toFixed(1)}
                </div>
                <div className="mt-3 font-bold text-gray-800 tracking-wide uppercase text-sm">
                  {verdict.band_label}
                </div>
              </div>
              <div>
                <p className="text-lg text-gray-700 leading-relaxed font-medium">{summary}</p>
                <p className="text-xs text-gray-400 mt-4 italic">{verdict.disclaimer}</p>
              </div>
            </div>
          </div>

          {/* Recommendation Block */}
          <div className={`p-6 rounded-2xl border-l-4`} style={{ borderColor: verdict.band_colour, backgroundColor: `${verdict.band_colour}10` }}>
            <h3 className="font-bold text-lg mb-3">Recommendation</h3>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800" dangerouslySetInnerHTML={{ __html: verdict.recommendation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            
            {verdict.show_cross_check && (
              <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                <h4 className="font-bold mb-3 text-sm uppercase tracking-wider">Hash Comparison Tool</h4>
                <p className="text-sm text-gray-600 mb-4">If the candidate re-downloads the letter on a video call, upload both copies here to verify if they are mathematically identical.</p>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <input type="file" onChange={e => setHashFile1(e.target.files?.[0] || null)} className="text-sm w-full md:w-auto" />
                  <input type="file" onChange={e => setHashFile2(e.target.files?.[0] || null)} className="text-sm w-full md:w-auto" />
                  <button onClick={compareHashes} disabled={hashLoading || !hashFile1 || !hashFile2} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold shrink-0">
                    {hashLoading ? 'Checking...' : 'Compare'}
                  </button>
                </div>
                {hashResult && (
                  <div className={`mt-4 p-3 rounded-lg text-sm font-semibold ${hashResult.match ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {hashResult.match ? '✅ Hashes match exactly. The files are identical.' : `❌ Files differ. Text differences found on ${hashResult.pages_different} pages.`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Findings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold font-[var(--font-heading)] text-xl mb-4 border-b pb-2">Findings ({findings.length})</h3>
              {findings.length === 0 ? (
                <p className="text-gray-500 italic">No anomalies detected.</p>
              ) : (
                <div className="space-y-4">
                  {findings.map((f, i) => (
                    <div key={i} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex gap-2 items-start">
                        <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold uppercase mt-0.5
                          ${f.severity === 'high' ? 'bg-red-100 text-red-700' : 
                            f.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 
                            'bg-gray-100 text-gray-600'}`}
                        >
                          {f.severity}
                        </span>
                        <div>
                          <h4 className="font-bold text-gray-900">{f.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{f.evidence}</p>
                          {f.innocent_explanation && (
                            <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                              <strong>Note:</strong> {f.innocent_explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold font-[var(--font-heading)] text-xl mb-4 border-b pb-2">Checks Passed</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 mb-8">
                {checks_passed.map((c, i) => <li key={i}>{c}</li>)}
              </ul>

              <h3 className="font-bold font-[var(--font-heading)] text-xl mb-4 border-b pb-2">Limitations</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-500">
                {limitations.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* COUNTER-OFFER TAB */}
      {activeTab === 'counter' && (
        <div className="space-y-8">
          {counter_offer_analysis.gated ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
              <svg className="w-16 h-16 text-amber-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <h3 className="text-xl font-bold mb-2">On Hold Pending Verification</h3>
              <p className="text-gray-600 max-w-lg mx-auto mb-6">{counter_offer_analysis.hold_reason}</p>
              <label className="flex items-center justify-center gap-3 cursor-pointer bg-gray-50 py-3 px-6 rounded-lg inline-flex mx-auto border border-gray-200">
                <input type="checkbox" className="w-5 h-5" onChange={(e) => {
                  if (e.target.checked) alert("Re-run the analysis with 'I have verified this offer' checked in the inputs.");
                }} />
                <span className="font-semibold text-gray-700">I have verified this offer with the candidate</span>
              </label>
            </div>
          ) : counter_offer_analysis.status === 'insufficient_inputs' ? (
            <div className="p-8 bg-white border border-gray-200 rounded-2xl">
              <h3 className="text-xl font-bold mb-2">Insufficient Inputs</h3>
              <p className="text-gray-600 mb-4">Please provide more information about the candidate's current role to generate a counter-offer strategy.</p>
              <ul className="list-disc pl-5 text-sm text-gray-500">
                {counter_offer_analysis.inputs_missing?.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          ) : (
            <>
              {/* Recommendation summary */}
              <div className="card-border-gradient p-8 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                        ${counter_offer_analysis.counter_offer_recommendation?.should_counter === 'yes' ? 'bg-green-100 text-green-700' :
                          counter_offer_analysis.counter_offer_recommendation?.should_counter === 'no' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'}`}
                      >
                        Counter: {counter_offer_analysis.counter_offer_recommendation?.should_counter.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                        ${counter_offer_analysis.retention_outlook?.band === 'likely_to_stay' ? 'bg-green-100 text-green-700' :
                          counter_offer_analysis.retention_outlook?.band === 'likely_to_leave' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'}`}
                      >
                        Outlook: {counter_offer_analysis.retention_outlook?.band.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed font-medium">
                      {counter_offer_analysis.counter_offer_recommendation?.reasoning}
                    </p>
                    
                    {counter_offer_analysis.counter_offer_recommendation?.guardrail_flags && counter_offer_analysis.counter_offer_recommendation.guardrail_flags.length > 0 && (
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                        {counter_offer_analysis.counter_offer_recommendation.guardrail_flags.map((f, i) => (
                          <div key={i} className="text-sm text-amber-800">
                            <strong>⚠️ {f.type.replace(/_/g, ' ')}:</strong> {f.detail}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 text-center flex flex-col justify-center">
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Target Uplift (Fixed CTC)</p>
                    {counter_offer_analysis.counter_offer_recommendation?.uplift_inr ? (
                      <>
                        <div className="text-3xl font-bold text-gray-900 font-[var(--font-heading)]">
                          {counter_offer_analysis.counter_offer_recommendation.uplift_inr.target_inr_formatted}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          +{counter_offer_analysis.counter_offer_recommendation.uplift_pct_range.target}% hike
                        </div>
                        <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
                          Range: {counter_offer_analysis.counter_offer_recommendation.uplift_pct_range.min}% - {counter_offer_analysis.counter_offer_recommendation.uplift_pct_range.max}%
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-400 italic">Provide current CTC to compute INR uplift.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Factors */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Factor</th>
                      <th className="px-6 py-4">Current</th>
                      <th className="px-6 py-4">New Offer</th>
                      <th className="px-6 py-4 text-center">Favours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {counter_offer_analysis.factor_comparison?.map((f, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-900">{f.factor.replace(/_/g, ' ')}</td>
                        <td className="px-6 py-4 text-gray-600">{f.current}</td>
                        <td className="px-6 py-4 text-gray-600">{f.new}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                            ${f.favours === 'stay' ? 'bg-green-100 text-green-700' :
                              f.favours === 'leave' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-500'}`}
                          >
                            {f.favours}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Levers */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-bold font-[var(--font-heading)] text-xl mb-4 border-b pb-2">Non-Monetary Levers</h3>
                  <div className="space-y-4">
                    {counter_offer_analysis.counter_offer_recommendation?.non_monetary_levers.map((l, i) => (
                      <div key={i}>
                        <h4 className="font-bold text-gray-900 text-sm">{l.lever}</h4>
                        <p className="text-xs text-gray-500 mt-1">{l.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Profile */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-bold font-[var(--font-heading)] text-xl mb-4 border-b pb-2">New Company: {counter_offer_analysis.new_offer_extracted?.issuer}</h3>
                  <p className="text-sm text-gray-700 mb-4">{counter_offer_analysis.new_company_profile?.summary}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Strengths</h4>
                      <ul className="text-sm space-y-1 text-green-700 list-disc pl-4">
                        {counter_offer_analysis.new_company_profile?.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Concerns</h4>
                      <ul className="text-sm space-y-1 text-red-700 list-disc pl-4">
                        {counter_offer_analysis.new_company_profile?.concerns.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-4 italic border-t pt-2">{counter_offer_analysis.new_company_profile?.caveat}</p>
                </div>
              </div>

              <p className="text-xs text-center text-gray-400 mt-8 max-w-2xl mx-auto">
                This is a prediction based on the documents and inputs provided. It cannot account for what the candidate personally values. Use it to prepare for the conversation, not as a final answer.
              </p>
            </>
          )}
        </div>
      )}

      {/* PAGE PREVIEWS TAB */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-[var(--font-heading)] text-xl">
              Rendered Pages ({result.metadata?.page_count || '?'} total)
            </h3>
            {result.signals?.flagged_pages?.length > 0 && (
              <span className="text-xs font-bold px-3 py-1 bg-red-100 text-red-700 rounded-full">
                {result.signals.flagged_pages.length} page(s) flagged
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Flagged pages and the first/last page are rendered at higher resolution (200 DPI) for detailed inspection.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Note: Page images are in the API response but base64 strings are large.
                In production, images would be served via a separate endpoint.
                Here we render them inline from the signals data if available. */}
            {(result as any)._page_images ? (
              (result as any)._page_images.map((img: any, i: number) => (
                <div key={i} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${
                  img.is_flagged ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'
                }`}>
                  <div className={`px-4 py-2 text-xs font-bold flex items-center justify-between ${
                    img.is_flagged ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'
                  }`}>
                    <span>{img.label}</span>
                    {img.is_flagged && (
                      <span className="bg-red-200 text-red-800 px-2 py-0.5 rounded text-[10px] uppercase">Flagged</span>
                    )}
                  </div>
                  <img
                    src={`data:image/png;base64,${img.base64_png}`}
                    alt={img.label}
                    className="w-full"
                    loading="lazy"
                  />
                </div>
              ))
            ) : (
              <div className="md:col-span-2 p-12 text-center bg-white rounded-2xl border border-gray-200">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <h4 className="font-bold text-gray-700 mb-2">Page images not included in response</h4>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Page images are rendered at analysis time and sent to the AI model, but are excluded from the API response to reduce payload size.
                  The flagged pages are: <strong>{result.signals?.flagged_pages?.join(', ') || 'none'}</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RAW DATA TAB */}
      {activeTab === 'meta' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="font-bold font-[var(--font-heading)] text-xl border-b pb-2">Extracted Metadata</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-auto max-h-[600px] shadow-inner">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
          <div className="space-y-6">
            <h3 className="font-bold font-[var(--font-heading)] text-xl border-b pb-2">Computed Signals</h3>
            <pre className="bg-gray-900 text-amber-400 p-4 rounded-xl text-xs overflow-auto max-h-[600px] shadow-inner">
              {JSON.stringify(signals, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
