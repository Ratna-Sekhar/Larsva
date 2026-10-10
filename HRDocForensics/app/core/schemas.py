"""
HRDocForensics — Pydantic v2 models for LLM structured output.

These models define the EXACT schema the LLM must return.
The JSON Schema is generated from them (so the two never drift)
and used with the Responses API's Structured Outputs.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


# ── Authenticity Findings ────────────────────────────────────────────


class Finding(BaseModel):
    category: Literal[
        "identity_consistency",
        "visual_tampering",
        "template_language",
        "metadata",
        "file_structure",
        "arithmetic_dates",
    ]
    severity: Literal["low", "medium", "high"]
    title: str
    evidence: str = Field(
        ...,
        description="Cite page numbers and the exact observed text or metadata field.",
    )
    innocent_explanation: str | None = None


# ── Counter-offer: extracted offer ───────────────────────────────────


class OneTimeItem(BaseModel):
    label: str
    amount_inr: float


class NewOfferExtracted(BaseModel):
    issuer: str
    designation: str
    location: str
    work_mode_stated: Literal["on_site", "hybrid", "remote", "not_stated"]
    work_mode_evidence: str
    fixed_ctc_annual_inr: float | None = None
    variable_target_annual_inr: float | None = None
    one_time_items: list[OneTimeItem] = []
    equity_notes: str | None = None
    total_ctc_annual_inr: float | None = None
    employer_pf_included_in_ctc: Literal["yes", "no", "unclear"]
    probation_terms: str
    notice_terms: str
    joining_date: str | None = None
    offer_deadline: str | None = None
    evidence_pages: list[int] = []


# ── Counter-offer: new company profile ───────────────────────────────


class NewCompanyProfile(BaseModel):
    summary: str
    strengths: list[str] = []
    concerns: list[str] = []
    knowledge_confidence: Literal["low", "medium", "high"]
    caveat: str


# ── Counter-offer: factor comparison ─────────────────────────────────


class FactorComparison(BaseModel):
    factor: str
    current: str
    new: str
    favours: Literal["stay", "leave", "neutral", "unknown"]
    weight: Literal["low", "medium", "high"]
    reasoning: str
    confidence: Literal["low", "medium", "high"]


# ── Counter-offer: retention outlook ─────────────────────────────────


class RetentionOutlook(BaseModel):
    band: Literal["likely_to_stay", "toss_up", "likely_to_leave"]
    key_drivers: list[str] = []
    unknowns: list[str] = []
    rationale: str


# ── Counter-offer: recommendation ────────────────────────────────────


class UpliftPctRange(BaseModel):
    min: float
    target: float
    max: float


class NonMonetaryLever(BaseModel):
    lever: str
    addresses_factor: str
    rationale: str


class CounterOfferRecommendation(BaseModel):
    should_counter: Literal["yes", "no", "conditional"]
    reasoning: str
    uplift_pct_range: UpliftPctRange
    confidence: Literal["low", "medium", "high"]
    non_monetary_levers: list[NonMonetaryLever] = []
    risks: list[str] = []
    approvals_needed: list[str] = []
    timing_note: str


# ── Counter-offer: top-level ─────────────────────────────────────────


class CounterOfferAnalysis(BaseModel):
    status: Literal["complete", "on_hold_pending_verification", "insufficient_inputs"]
    hold_reason: str | None = None
    new_offer_extracted: NewOfferExtracted | None = None
    new_company_profile: NewCompanyProfile | None = None
    factor_comparison: list[FactorComparison] | None = None
    retention_outlook: RetentionOutlook | None = None
    counter_offer_recommendation: CounterOfferRecommendation | None = None
    inputs_missing: list[str] | None = None


# ── Root LLM output ──────────────────────────────────────────────────


class LLMForensicResult(BaseModel):
    """Root schema for the single LLM call output.

    Notes:
    - No verdict field. Verdict labels come from code (scoring.py).
    - No recommended_next_steps field. Those come from config.
    - The LLM must NOT output rupee amounts for counter-offer
      recommendations, only percentages. Code computes rupees.
    """

    fakeness_score: int = Field(..., ge=0, le=100)
    confidence: Literal["low", "medium", "high"]
    summary: str = Field(
        ...,
        description="3-4 plain sentences summarising the analysis.",
    )
    findings: list[Finding] = []
    checks_passed: list[str] = []
    limitations: list[str] = []
    counter_offer_analysis: CounterOfferAnalysis


# ── JSON Schema generation ───────────────────────────────────────────


def generate_json_schema() -> dict:
    """Generate the JSON Schema for strict Structured Outputs.

    Adds additionalProperties: false everywhere and ensures all
    properties are in 'required' as needed by the Responses API.
    """
    schema = LLMForensicResult.model_json_schema(mode="serialization")

    def _enforce_strict(obj: dict) -> dict:
        """Recursively enforce strict-mode requirements."""
        if obj.get("type") == "object":
            obj["additionalProperties"] = False
            # Ensure all properties are required
            if "properties" in obj:
                obj["required"] = list(obj["properties"].keys())
                for prop in obj["properties"].values():
                    if isinstance(prop, dict):
                        _enforce_strict(prop)

        # Handle arrays
        if obj.get("type") == "array" and "items" in obj:
            if isinstance(obj["items"], dict):
                _enforce_strict(obj["items"])

        # Handle anyOf / oneOf (nullable types)
        for key in ("anyOf", "oneOf"):
            if key in obj:
                for item in obj[key]:
                    if isinstance(item, dict):
                        _enforce_strict(item)

        # Handle $defs
        if "$defs" in obj:
            for defn in obj["$defs"].values():
                if isinstance(defn, dict):
                    _enforce_strict(defn)

        return obj

    return _enforce_strict(schema)
