"""
HRDocForensics — API input models.

Pydantic models for request validation with extra="forbid"
to reject unknown fields. Explicitly excludes personal attributes.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class AuthenticityContext(BaseModel):
    """Optional context for the authenticity analysis."""

    model_config = {"extra": "forbid"}

    document_type: Literal[
        "Offer letter", "Relieving letter", "Experience letter", "Payslip", "Other"
    ] | None = None
    claimed_issuer: str | None = None
    candidate_name_as_submitted: str | None = None
    expected_timezone: str = "Asia/Kolkata"


class CounterOfferInputs(BaseModel):
    """Optional counter-offer inputs from HR.

    Does NOT include fields for age, gender, marital/family status,
    religion, caste, health, nationality, or any other personal attribute.
    """

    model_config = {"extra": "forbid"}

    # Current company profile
    current_company_name: str | None = None
    role_title: str | None = None
    level_or_grade: str | None = None
    tenure_years: float | None = None
    current_fixed_ctc_inr: float | None = None
    current_variable_target_inr: float | None = None
    current_location: str | None = None
    current_work_mode: Literal["on_site", "hybrid", "remote"] | None = None
    hybrid_days_per_week: int | None = None
    last_performance_rating: Literal["Exceeds", "Meets", "Below", "Not rated"] | None = None
    promotion_due: Literal["yes", "no", "unknown"] | None = None
    role_band_min_inr: float | None = None
    role_band_mid_inr: float | None = None
    role_band_max_inr: float | None = None
    peer_median_fixed_ctc_inr: float | None = None
    budget_ceiling_hike_pct: float | None = None
    notice_period_days: int | None = None
    company_strengths_notes: str | None = None
    new_company_notes: str | None = None
    candidate_priorities: list[Literal[
        "compensation",
        "growth/title",
        "work-from-home flexibility",
        "location",
        "company brand",
        "job stability",
        "learning",
        "manager/team",
        "none known",
    ]] | None = None
    hr_confirms_offer_verified: bool = False
