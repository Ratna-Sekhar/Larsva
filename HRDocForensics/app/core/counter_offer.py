"""
HRDocForensics — Counter-offer post-processing.

All logic here is DETERMINISTIC (code, not LLM):
- Validate extracted figures (sum check within 1%)
- Compute deltas (INR and %), variable share
- Convert uplift_pct_range to rupees
- Guardrails: budget ceiling, band max, internal equity flags
- Gating: if authenticity < 4 and unverified → hold notice only
"""

from __future__ import annotations

from typing import Any

from app.core.config import load_retention_factors_yaml
from app.core.schemas import LLMForensicResult, CounterOfferAnalysis
from app.utils.formatting import format_inr, format_pct, format_delta_inr


# ── Factor weight resolution ─────────────────────────────────────────


def resolve_factor_weights(
    candidate_priorities: list[str] | None = None,
) -> dict[str, str]:
    """Resolve factor weights from defaults + candidate priorities.

    If candidate_priorities are given, matching factors are elevated
    to 'high'.
    """
    config = load_retention_factors_yaml()
    weights = dict(config.get("defaults", {}))

    if candidate_priorities:
        mapping = config.get("priority_to_factor", {})
        for priority in candidate_priorities:
            factor_key = mapping.get(priority)
            if factor_key and factor_key in weights:
                weights[factor_key] = "high"

    return weights


# ── Figure validation ────────────────────────────────────────────────


def _validate_extracted_figures(offer: dict[str, Any]) -> dict[str, Any]:
    """Check that fixed + variable + one-time sums to total within 1%.

    Returns validation result with confidence and message.
    """
    fixed = offer.get("fixed_ctc_annual_inr") or 0
    variable = offer.get("variable_target_annual_inr") or 0
    one_time_total = sum(
        item.get("amount_inr", 0) for item in (offer.get("one_time_items") or [])
    )
    stated_total = offer.get("total_ctc_annual_inr")

    if stated_total is None or stated_total == 0:
        return {
            "valid": True,
            "extraction_confidence": "low",
            "message": "No total CTC stated in the offer. Cannot verify sum.",
        }

    # One-time items should NOT be in annualised total
    computed_recurring = fixed + variable
    tolerance = 0.01 * stated_total  # 1%

    if abs(computed_recurring - stated_total) <= tolerance:
        return {
            "valid": True,
            "extraction_confidence": "high",
            "message": f"Fixed ({format_inr(fixed)}) + Variable ({format_inr(variable)}) = {format_inr(computed_recurring)}, matches stated total {format_inr(stated_total)}.",
        }
    else:
        return {
            "valid": False,
            "extraction_confidence": "low",
            "message": (
                f"Figures may be mis-extracted. Verify against the letter. "
                f"Fixed ({format_inr(fixed)}) + Variable ({format_inr(variable)}) = "
                f"{format_inr(computed_recurring)}, but stated total is {format_inr(stated_total)} "
                f"(difference: {format_inr(abs(computed_recurring - stated_total))})."
            ),
        }


# ── Delta computation ────────────────────────────────────────────────


def _compute_deltas(
    current_fixed: float | None,
    current_variable: float | None,
    new_fixed: float | None,
    new_variable: float | None,
) -> dict[str, Any]:
    """Compute fixed and total deltas in INR and percentage."""
    result: dict[str, Any] = {}

    if current_fixed and new_fixed:
        fixed_delta = new_fixed - current_fixed
        fixed_delta_pct = (fixed_delta / current_fixed) * 100
        result["fixed_delta_inr"] = fixed_delta
        result["fixed_delta_pct"] = round(fixed_delta_pct, 1)
        result["fixed_delta_inr_formatted"] = format_delta_inr(fixed_delta)
        result["fixed_delta_pct_formatted"] = format_pct(fixed_delta_pct)

    current_total = (current_fixed or 0) + (current_variable or 0)
    new_total = (new_fixed or 0) + (new_variable or 0)

    if current_total > 0 and new_total > 0:
        total_delta = new_total - current_total
        total_delta_pct = (total_delta / current_total) * 100
        result["total_delta_inr"] = total_delta
        result["total_delta_pct"] = round(total_delta_pct, 1)
        result["total_delta_inr_formatted"] = format_delta_inr(total_delta)
        result["total_delta_pct_formatted"] = format_pct(total_delta_pct)

    # Variable share
    if new_total > 0 and new_variable:
        result["new_variable_share_pct"] = round((new_variable / new_total) * 100, 1)
    if current_total > 0 and current_variable:
        result["current_variable_share_pct"] = round((current_variable / current_total) * 100, 1)

    return result


# ── Uplift to rupees ─────────────────────────────────────────────────


def _uplift_to_rupees(
    uplift_pct_range: dict[str, float],
    current_fixed: float,
) -> dict[str, Any]:
    """Convert uplift percentages to absolute INR values."""
    return {
        "min_inr": round(current_fixed * (1 + uplift_pct_range["min"] / 100)),
        "target_inr": round(current_fixed * (1 + uplift_pct_range["target"] / 100)),
        "max_inr": round(current_fixed * (1 + uplift_pct_range["max"] / 100)),
        "min_inr_formatted": format_inr(current_fixed * (1 + uplift_pct_range["min"] / 100)),
        "target_inr_formatted": format_inr(current_fixed * (1 + uplift_pct_range["target"] / 100)),
        "max_inr_formatted": format_inr(current_fixed * (1 + uplift_pct_range["max"] / 100)),
    }


# ── Guardrails ───────────────────────────────────────────────────────


def _apply_guardrails(
    uplift_rupees: dict[str, Any],
    counter_offer_inputs: dict[str, Any],
) -> list[dict[str, str]]:
    """Check budget ceiling, band max, and internal equity risk."""
    flags: list[dict[str, str]] = []

    budget_ceiling_pct = counter_offer_inputs.get("budget_ceiling_hike_pct")
    role_band_max = counter_offer_inputs.get("role_band_max_inr")
    peer_median = counter_offer_inputs.get("peer_median_fixed_ctc_inr")

    target_inr = uplift_rupees.get("target_inr", 0)
    max_inr = uplift_rupees.get("max_inr", 0)

    current_fixed = counter_offer_inputs.get("current_fixed_ctc_inr", 0)

    # Budget ceiling
    if budget_ceiling_pct and current_fixed:
        ceiling_inr = current_fixed * (1 + budget_ceiling_pct / 100)
        if max_inr > ceiling_inr:
            flags.append({
                "type": "exceeds_budget",
                "detail": (
                    f"Recommended max ({format_inr(max_inr)}) exceeds "
                    f"budget ceiling ({format_pct(budget_ceiling_pct)} = {format_inr(ceiling_inr)}). "
                    f"Approval from compensation committee needed."
                ),
            })

    # Band max
    if role_band_max and max_inr > role_band_max:
        flags.append({
            "type": "exceeds_band",
            "detail": (
                f"Recommended max ({format_inr(max_inr)}) exceeds "
                f"role band maximum ({format_inr(role_band_max)}). "
                f"Band exception or re-levelling approval needed."
            ),
        })

    # Internal equity risk
    if peer_median and target_inr > 0:
        config = load_retention_factors_yaml()
        threshold_pct = config.get("internal_equity_risk_threshold_pct", 15)
        equity_ceiling = peer_median * (1 + threshold_pct / 100)
        if target_inr > equity_ceiling:
            flags.append({
                "type": "internal_equity_risk",
                "detail": (
                    f"Target counter-offer ({format_inr(target_inr)}) exceeds "
                    f"peer median ({format_inr(peer_median)}) by more than "
                    f"{threshold_pct}%. Internal pay equity risk."
                ),
            })

    return flags


# ── Main post-processing ─────────────────────────────────────────────


def post_process_counter_offer(
    llm_result: LLMForensicResult,
    authenticity_score: float,
    counter_offer_inputs: dict[str, Any] | None,
    hr_confirms_verified: bool = False,
) -> dict[str, Any]:
    """Post-process the LLM's counter-offer analysis.

    - Gating: if authenticity < 4 and unverified → hold notice
    - Validate figures
    - Compute deltas
    - Convert uplift % to rupees
    - Apply guardrails
    - Format INR with Indian digit grouping
    """
    co = llm_result.counter_offer_analysis

    # Gating
    if authenticity_score < 4.0 and not hr_confirms_verified:
        return {
            "status": "on_hold_pending_verification",
            "hold_reason": (
                "Counter-offer analysis is on hold until the offer is verified. "
                "The document's authenticity score is below threshold."
            ),
            "gated": True,
        }

    if co.status != "complete":
        return {
            "status": co.status,
            "hold_reason": co.hold_reason,
            "inputs_missing": co.inputs_missing,
            "gated": co.status == "on_hold_pending_verification",
        }

    result: dict[str, Any] = {
        "status": "complete",
        "gated": False,
    }

    # Extracted offer (formatted)
    if co.new_offer_extracted:
        offer = co.new_offer_extracted.model_dump()
        result["new_offer_extracted"] = offer

        # Format INR values
        for key in ("fixed_ctc_annual_inr", "variable_target_annual_inr", "total_ctc_annual_inr"):
            val = offer.get(key)
            if val is not None:
                offer[f"{key}_formatted"] = format_inr(val)

        for item in offer.get("one_time_items", []):
            item["amount_inr_formatted"] = format_inr(item.get("amount_inr"))

        # Validate figures
        result["figure_validation"] = _validate_extracted_figures(offer)

    # Deltas
    if counter_offer_inputs and co.new_offer_extracted:
        deltas = _compute_deltas(
            current_fixed=counter_offer_inputs.get("current_fixed_ctc_inr"),
            current_variable=counter_offer_inputs.get("current_variable_target_inr"),
            new_fixed=co.new_offer_extracted.fixed_ctc_annual_inr,
            new_variable=co.new_offer_extracted.variable_target_annual_inr,
        )
        result["deltas"] = deltas

    # New company profile
    if co.new_company_profile:
        result["new_company_profile"] = co.new_company_profile.model_dump()

    # Factor comparison
    if co.factor_comparison:
        result["factor_comparison"] = [f.model_dump() for f in co.factor_comparison]

    # Retention outlook
    if co.retention_outlook:
        result["retention_outlook"] = co.retention_outlook.model_dump()

    # Counter-offer recommendation with rupee conversion
    if co.counter_offer_recommendation and counter_offer_inputs:
        rec = co.counter_offer_recommendation.model_dump()
        current_fixed = counter_offer_inputs.get("current_fixed_ctc_inr")

        if current_fixed and rec.get("uplift_pct_range"):
            uplift_rupees = _uplift_to_rupees(rec["uplift_pct_range"], current_fixed)
            rec["uplift_inr"] = uplift_rupees

            # Apply guardrails
            rec["guardrail_flags"] = _apply_guardrails(uplift_rupees, counter_offer_inputs)
        else:
            rec["uplift_inr"] = None
            rec["guardrail_flags"] = []

        result["counter_offer_recommendation"] = rec

    # Inputs missing
    if co.inputs_missing:
        result["inputs_missing"] = co.inputs_missing

    return result
