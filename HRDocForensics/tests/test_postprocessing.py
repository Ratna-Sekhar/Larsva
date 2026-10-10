import pytest
from app.core.counter_offer import _validate_extracted_figures, _compute_deltas, _uplift_to_rupees, _apply_guardrails

def test_validate_figures():
    offer1 = {
        "fixed_ctc_annual_inr": 1000000,
        "variable_target_annual_inr": 200000,
        "total_ctc_annual_inr": 1200000,
        "one_time_items": [{"amount_inr": 50000}]
    }
    res1 = _validate_extracted_figures(offer1)
    assert res1["valid"] is True
    
    # Missing 10% should fail
    offer2 = {
        "fixed_ctc_annual_inr": 1000000,
        "variable_target_annual_inr": 200000,
        "total_ctc_annual_inr": 1300000
    }
    res2 = _validate_extracted_figures(offer2)
    assert res2["valid"] is False

def test_compute_deltas():
    deltas = _compute_deltas(1000000, 100000, 1200000, 200000)
    assert deltas["fixed_delta_inr"] == 200000
    assert deltas["fixed_delta_pct"] == 20.0
    assert deltas["total_delta_inr"] == 300000
    assert deltas["total_delta_pct"] == 27.3

def test_uplift_to_rupees():
    ranges = {"min": 10, "target": 20, "max": 30}
    rupees = _uplift_to_rupees(ranges, 1000000)
    assert rupees["min_inr"] == 1100000
    assert rupees["target_inr"] == 1200000
    assert rupees["max_inr"] == 1300000
    assert rupees["target_inr_formatted"] == "₹12,00,000"

def test_apply_guardrails():
    inputs = {
        "budget_ceiling_hike_pct": 25,
        "role_band_max_inr": 1250000,
        "peer_median_fixed_ctc_inr": 1000000,
        "current_fixed_ctc_inr": 1000000
    }
    uplift = {"target_inr": 1200000, "max_inr": 1300000}
    
    flags = _apply_guardrails(uplift, inputs)
    assert len(flags) == 3
    types = [f["type"] for f in flags]
    assert "exceeds_budget" in types # max 13L > ceiling 12.5L
    assert "exceeds_band" in types   # max 13L > band max 12.5L
    assert "internal_equity_risk" in types # target 12L > 15% over 10L median
