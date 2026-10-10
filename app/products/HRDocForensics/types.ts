export type CounterOfferAnalysis = {
  status: 'complete' | 'on_hold_pending_verification' | 'insufficient_inputs';
  hold_reason?: string;
  gated?: boolean;
  new_offer_extracted?: {
    issuer: string;
    designation: string;
    location: string;
    work_mode_stated: string;
    work_mode_evidence: string;
    fixed_ctc_annual_inr_formatted?: string;
    variable_target_annual_inr_formatted?: string;
    total_ctc_annual_inr_formatted?: string;
    employer_pf_included_in_ctc: string;
    one_time_items: Array<{ label: string; amount_inr_formatted: string }>;
    probation_terms: string;
    notice_terms: string;
    joining_date?: string;
    offer_deadline?: string;
  };
  figure_validation?: {
    valid: boolean;
    extraction_confidence: string;
    message: string;
  };
  deltas?: {
    fixed_delta_inr_formatted: string;
    fixed_delta_pct_formatted: string;
    total_delta_inr_formatted: string;
    total_delta_pct_formatted: string;
  };
  new_company_profile?: {
    summary: string;
    strengths: string[];
    concerns: string[];
    knowledge_confidence: string;
    caveat: string;
  };
  factor_comparison?: Array<{
    factor: string;
    current: string;
    new: string;
    favours: 'stay' | 'leave' | 'neutral' | 'unknown';
    weight: string;
    reasoning: string;
  }>;
  retention_outlook?: {
    band: 'likely_to_stay' | 'toss_up' | 'likely_to_leave';
    key_drivers: string[];
    unknowns: string[];
    rationale: string;
  };
  counter_offer_recommendation?: {
    should_counter: string;
    reasoning: string;
    uplift_pct_range: { min: number; target: number; max: number };
    uplift_inr?: { min_inr_formatted: string; target_inr_formatted: string; max_inr_formatted: string };
    confidence: string;
    non_monetary_levers: Array<{ lever: string; addresses_factor: string; rationale: string }>;
    risks: string[];
    approvals_needed: string[];
    timing_note: string;
    guardrail_flags?: Array<{ type: string; detail: string }>;
  };
  inputs_missing?: string[];
};

export type AnalysisResult = {
  verdict: {
    authenticity_score: number;
    band_key: string;
    band_label: string;
    band_colour: string;
    recommendation: string;
    show_cross_check: boolean;
    disclaimer: string;
  };
  summary: string;
  findings: Array<{
    category: string;
    severity: string;
    title: string;
    evidence: string;
    innocent_explanation?: string;
  }>;
  checks_passed: string[];
  limitations: string[];
  counter_offer_analysis: CounterOfferAnalysis;
  metadata: any;
  signals: any;
};
