import pytest
from app.core.signals import (
    _compute_text_layer_order_anomalies,
    _compute_date_anomalies,
    _compute_flag_conflicts,
    _check_text_extractable
)

def test_date_anomalies():
    # ModDate after CreationDate
    meta1 = {
        "creation_date": {"datetime_iso": "2024-01-01T10:00:00"},
        "mod_date": {"datetime_iso": "2024-01-02T10:00:00", "date": "2024-01-02", "time": "10:00"}
    }
    anomalies = _compute_date_anomalies(meta1)
    assert len(anomalies) == 1
    assert anomalies[0]["type"] == "mod_after_creation"

    # Timezone mismatch
    meta2 = {
        "creation_date": {"tz_offset_hours": 0.0, "tz_offset_str": "Z"}
    }
    anomalies = _compute_date_anomalies(meta2, "Asia/Kolkata")
    assert len(anomalies) == 1
    assert anomalies[0]["type"] == "timezone_mismatch"

def test_flag_conflicts():
    meta = {
        "acroform": {"has_acroform": True, "field_count": 0},
        "all_fonts": [{"name": "Arial", "embedded": False}]
    }
    conflicts = _compute_flag_conflicts(meta)
    assert len(conflicts) == 2
    types = [c["type"] for c in conflicts]
    assert "acroform_no_fields" in types
    assert "unembedded_fonts" in types

def test_text_extractable():
    meta1 = {"text_per_page": ["", ""], "page_count": 2}
    res1 = _check_text_extractable(meta1)
    assert res1["text_extractable"] is False

    meta2 = {"text_per_page": ["Hello", ""], "page_count": 2}
    res2 = _check_text_extractable(meta2)
    assert res2["text_extractable"] is True
    assert res2["partially_scanned"] is True

    meta3 = {"text_per_page": ["Hello", "World"], "page_count": 2}
    res3 = _check_text_extractable(meta3)
    assert res3["text_extractable"] is True
    assert "partially_scanned" not in res3
