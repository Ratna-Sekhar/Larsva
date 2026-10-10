'use client';

import { useState, useRef, useEffect } from 'react';

type Props = {
  onUpload: (formData: FormData) => void;
};

export default function UploadSection({ onUpload }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [showCounterOffer, setShowCounterOffer] = useState(false);

  // Context fields
  const [docType, setDocType] = useState('Offer letter');
  const [claimedIssuer, setClaimedIssuer] = useState('');
  
  // Counter-offer fields
  const [coData, setCoData] = useState<any>({});

  // Load saved company profile
  useEffect(() => {
    const saved = localStorage.getItem('hrdocforensics_company_profile');
    if (saved) {
      try {
        setCoData(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleCoChange = (field: string, value: any) => {
    setCoData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePriorityToggle = (priority: string) => {
    const current = coData.candidate_priorities || [];
    if (current.includes(priority)) {
      handleCoChange('candidate_priorities', current.filter((p: string) => p !== priority));
    } else {
      handleCoChange('candidate_priorities', [...current, priority]);
    }
  };

  const saveProfile = () => {
    // Only save the company configuration parts, not candidate-specific things
    const toSave = {
      current_company_name: coData.current_company_name,
      role_band_min_inr: coData.role_band_min_inr,
      role_band_mid_inr: coData.role_band_mid_inr,
      role_band_max_inr: coData.role_band_max_inr,
      budget_ceiling_hike_pct: coData.budget_ceiling_hike_pct,
      company_strengths_notes: coData.company_strengths_notes,
    };
    localStorage.setItem('hrdocforensics_company_profile', JSON.stringify(toSave));
    alert('Company profile saved to browser storage.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !consent) return;

    const formData = new FormData();
    formData.append('file', file);
    
    // Build context
    const context = {
      document_type: docType,
      claimed_issuer: claimedIssuer || undefined,
    };
    formData.append('context', JSON.stringify(context));

    // Build counter-offer inputs
    if (showCounterOffer && Object.keys(coData).length > 0) {
      // Clean up empty numbers
      const cleanedCo = { ...coData };
      ['current_fixed_ctc_inr', 'current_variable_target_inr', 'tenure_years', 'hybrid_days_per_week', 
       'role_band_min_inr', 'role_band_mid_inr', 'role_band_max_inr', 'peer_median_fixed_ctc_inr',
       'budget_ceiling_hike_pct', 'notice_period_days'].forEach(k => {
        if (cleanedCo[k] === '') delete cleanedCo[k];
        else if (cleanedCo[k] !== undefined) cleanedCo[k] = Number(cleanedCo[k]);
      });
      formData.append('counter_offer_inputs', JSON.stringify(cleanedCo));
    }

    onUpload(formData);
  };

  return (
    <div className="card-border-gradient p-8 md:p-12 mt-8 animate-fade-in-up delay-200 bg-white">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-[rgba(0,194,168,0.3)] rounded-2xl p-10 text-center bg-[var(--color-teal-100)] hover:bg-[rgba(0,194,168,0.1)] transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept="application/pdf"
            className="hidden" 
          />
          <svg className="w-12 h-12 text-[var(--color-teal-500)] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {file ? (
            <p className="text-lg font-bold text-[var(--color-navy-900)]">{file.name}</p>
          ) : (
            <>
              <p className="text-lg font-bold text-[var(--color-navy-900)] mb-1">Click to upload PDF</p>
              <p className="text-sm text-[var(--color-text-secondary)]">or drag and drop (Max 10MB)</p>
            </>
          )}
        </div>

        {/* Consent */}
        <label className="flex items-start gap-3 cursor-pointer p-4 bg-[var(--color-bg-primary)] rounded-xl border border-[rgba(0,0,0,0.05)]">
          <input 
            type="checkbox" 
            checked={consent} 
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 w-4 h-4 text-[var(--color-teal-500)] rounded"
          />
          <span className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            I confirm that I am authorised to upload this document. I understand that its pages are processed by a third-party AI provider (OpenAI) and are not retained by Larsva by default.
          </span>
        </label>

        {/* Basic Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Document Type</label>
            <select className="form-input" value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option>Offer letter</option>
              <option>Relieving letter</option>
              <option>Experience letter</option>
              <option>Payslip</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Expected Issuer (Optional)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Acme Corp" 
              value={claimedIssuer}
              onChange={(e) => setClaimedIssuer(e.target.value)}
            />
          </div>
        </div>

        {/* Counter-offer toggle */}
        <div className="pt-6 border-t border-gray-100">
          <button 
            type="button" 
            onClick={() => setShowCounterOffer(!showCounterOffer)}
            className="flex items-center justify-between w-full font-bold text-lg text-[var(--color-navy-900)]"
          >
            Counter-offer Analysis Inputs
            <svg className={`w-5 h-5 transition-transform ${showCounterOffer ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {showCounterOffer && (
            <div className="mt-6 space-y-6 animate-fade-in">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm mb-6 flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p><strong>Privacy Notice:</strong> Do not enter personal or sensitive details about the candidate (e.g. age, gender, marital status, health). Provide only professional and compensation data.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Candidate's Current CTC (Fixed INR)</label>
                  <input type="number" className="form-input" value={coData.current_fixed_ctc_inr || ''} onChange={(e) => handleCoChange('current_fixed_ctc_inr', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Role / Title</label>
                  <input type="text" className="form-input" value={coData.role_title || ''} onChange={(e) => handleCoChange('role_title', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Performance Rating</label>
                  <select className="form-input" value={coData.last_performance_rating || ''} onChange={(e) => handleCoChange('last_performance_rating', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Exceeds">Exceeds Expectations</option>
                    <option value="Meets">Meets Expectations</option>
                    <option value="Below">Below Expectations</option>
                    <option value="Not rated">Not rated yet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Promotion Due?</label>
                  <select className="form-input" value={coData.promotion_due || ''} onChange={(e) => handleCoChange('promotion_due', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Budget Ceiling Hike %</label>
                  <input type="number" className="form-input" value={coData.budget_ceiling_hike_pct || ''} onChange={(e) => handleCoChange('budget_ceiling_hike_pct', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Role Band Max (INR)</label>
                  <input type="number" className="form-input" value={coData.role_band_max_inr || ''} onChange={(e) => handleCoChange('role_band_max_inr', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Candidate's Known Priorities (Select multiple)</label>
                <div className="flex flex-wrap gap-2">
                  {['compensation', 'growth/title', 'work-from-home flexibility', 'location', 'company brand', 'job stability', 'learning', 'manager/team'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePriorityToggle(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        (coData.candidate_priorities || []).includes(p)
                          ? 'bg-[var(--color-navy-900)] text-white border-[var(--color-navy-900)]'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="button" onClick={saveProfile} className="text-sm font-semibold text-[var(--color-teal-500)] hover:underline">
                  Save Company Settings to Browser
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6">
          <button 
            type="submit" 
            disabled={!file || !consent}
            className={`btn-primary w-full justify-center ${(!file || !consent) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Analyze Document
            <svg className="w-5 h-5 btn-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
}
