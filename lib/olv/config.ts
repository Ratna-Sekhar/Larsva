/* ── OLV Configuration ── */
import type { OLVPlan } from './types';

// ── Plan Definitions ──
export const PLANS: Record<OLVPlan, { label: string; monthlyLimit: number; description: string }> = {
  starter: { label: 'Starter', monthlyLimit: 10, description: '10 verifications / month' },
  growth:  { label: 'Growth',  monthlyLimit: 50, description: '50 verifications / month' },
  scale:   { label: 'Scale',   monthlyLimit: 100, description: '100 verifications / month' },
};

export const DEFAULT_PLAN: OLVPlan = 'starter';

// ── Upload Limits ──
export const MAX_FILE_SIZE_MB = 15;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ['application/pdf'];
export const ALLOWED_EXTENSIONS = ['.pdf'];

// ── OpenAI ──
export const OPENAI_MODEL = 'gpt-4o';
export const OPENAI_MAX_TOKENS = 4096;

// ── Auth ──
export const JWT_COOKIE_NAME = 'olv_token';
export const JWT_EXPIRY = '7d';
export const SALT_ROUNDS = 10;

// ── Paths ──
export const OLV_BASE = '/products/offer-letter-verification';
export const OLV_DASHBOARD = `${OLV_BASE}/dashboard`;
export const OLV_SIGNIN = `${OLV_BASE}/auth/signin`;
export const OLV_SIGNUP = `${OLV_BASE}/auth/signup`;
