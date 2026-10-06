/* ── OLV Types ── */

// ── Auth ──
export interface OLVUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  company: string;
  jobTitle: string;
  plan: OLVPlan;
  monthlyLimit: number;
  createdAt: string;
  updatedAt: string;
}

export type OLVPlan = 'starter' | 'growth' | 'scale';

export interface OLVUserPublic {
  id: string;
  email: string;
  fullName: string;
  company: string;
  jobTitle: string;
  plan: OLVPlan;
  monthlyLimit: number;
  createdAt: string;
}

// ── Usage ──
export interface OLVUsageRecord {
  userId: string;
  month: string; // YYYY-MM
  count: number;
}

// ── Verification History ──
export interface OLVVerificationRecord {
  id: string;
  userId: string;
  timestamp: string;
  riskLevel: RiskLevel;
  riskScore: number;
  candidateRef: string; // optional anonymized reference
  resultSummary: string;
}

// ── Analysis ──
export type RiskLevel = 'low_risk' | 'review_recommended' | 'high_risk';
export type SignalAssessment = 'good' | 'review' | 'warning' | 'critical';
export type IndicatorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ActionPriority = 'immediate' | 'standard' | 'optional';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface VerificationResult {
  overallAssessment: RiskLevel;
  riskScore: number;
  confidence: ConfidenceLevel;
  executiveSummary: string;

  extractedInfo: {
    employer: {
      companyName: string | null;
      address: string | null;
      website: string | null;
      contactEmail: string | null;
      contactPhone: string | null;
    };
    candidate: {
      name: string | null;
    };
    position: {
      jobTitle: string | null;
      department: string | null;
      location: string | null;
      employmentType: string | null;
    };
    compensation: {
      annualCTC: string | null;
      fixedComponent: string | null;
      variableComponent: string | null;
      otherBenefits: string | null;
    };
    dates: {
      offerDate: string | null;
      joiningDate: string | null;
      validityDate: string | null;
      responseDeadline: string | null;
    };
  };

  signalBreakdown: {
    category: string;
    assessment: SignalAssessment;
    detail: string;
  }[];

  riskIndicators: {
    title: string;
    severity: IndicatorSeverity;
    explanation: string;
    evidence: string;
    whyItMatters: string;
    recommendedAction: string;
  }[];

  positiveSignals: {
    title: string;
    detail: string;
  }[];

  recommendedActions: {
    priority: ActionPriority;
    action: string;
    reason: string;
  }[];
}

// ── API Responses ──
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  fullName: string;
  company: string;
  jobTitle: string;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
  plan: OLVPlan;
  month: string;
}
