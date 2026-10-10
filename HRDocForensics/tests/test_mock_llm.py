"""
HRDocForensics — Mock-LLM integration test.

Patches the OpenAI client so the full pipeline can be tested
end-to-end without real API calls or spend.
"""

import json
import pytest
from unittest.mock import patch, MagicMock

from app.core.schemas import LLMForensicResult
from app.core.pipeline import analyze_document


# A minimal valid LLM response matching the Pydantic schema
MOCK_LLM_OUTPUT = {
    "fakeness_score": 15,
    "confidence": "high",
    "summary": "The document appears genuine. Metadata, fonts, and layout are consistent with standard corporate PDF generation.",
    "findings": [
        {
            "category": "metadata",
            "severity": "low",
            "title": "Producer string is a common PDF editor",
            "evidence": "Producer: 'Adobe Acrobat Pro DC' (page 1 metadata).",
            "innocent_explanation": "Many organisations use Acrobat Pro for signing and stamping.",
        }
    ],
    "checks_passed": [
        "No text-layer order anomalies detected",
        "Font usage is consistent across all pages",
        "Creation and modification dates are plausible",
    ],
    "limitations": [
        "Document only has 1 page; limited cross-page consistency checks.",
    ],
    "counter_offer_analysis": {
        "status": "insufficient_inputs",
        "hold_reason": None,
        "new_offer_extracted": None,
        "new_company_profile": None,
        "factor_comparison": None,
        "retention_outlook": None,
        "counter_offer_recommendation": None,
        "inputs_missing": [
            "current_fixed_ctc_inr",
            "role_title",
        ],
    },
}


def _build_mock_response():
    """Build a mock OpenAI Responses API response object."""
    # Content item
    content_item = MagicMock()
    content_item.text = json.dumps(MOCK_LLM_OUTPUT)

    # Output item
    output_item = MagicMock()
    output_item.content = [content_item]
    output_item.refusal = None

    # Usage
    usage = MagicMock()
    usage.input_tokens = 5000
    usage.output_tokens = 2000
    usage.output_tokens_details = MagicMock()
    usage.output_tokens_details.reasoning_tokens = 800

    # Response
    response = MagicMock()
    response.output = [output_item]
    response.usage = usage
    response.status = "completed"

    return response


def _make_minimal_pdf() -> bytes:
    """Create a minimal valid PDF in memory (1 page, 'Hello World')."""
    # Minimal PDF 1.4 with a single page containing text
    pdf = b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 44>>stream
BT /F1 12 Tf 100 700 Td (Hello World) Tj ET
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000360 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
430
%%EOF"""
    return pdf


class TestMockLLMPipeline:
    """Test the full pipeline with a mocked LLM client."""

    @patch("app.core.llm_client.OpenAI")
    def test_full_pipeline_returns_valid_result(self, mock_openai_class):
        """The pipeline should return a complete result dict
        with verdict, findings, and counter-offer analysis."""
        mock_client = MagicMock()
        mock_client.responses.create.return_value = _build_mock_response()
        mock_openai_class.return_value = mock_client

        pdf_bytes = _make_minimal_pdf()
        context = {
            "document_type": "Offer letter",
            "claimed_issuer": "Acme Corp",
        }

        result = analyze_document(pdf_bytes, context=context)

        # Verify structure
        assert "verdict" in result
        assert "summary" in result
        assert "findings" in result
        assert "counter_offer_analysis" in result
        assert "metadata" in result
        assert "signals" in result
        assert "usage" in result

        # Verify score conversion
        # fakeness_score=15 → authenticity = (100-15)/10 = 8.5
        assert result["verdict"]["authenticity_score"] == 8.5
        assert result["verdict"]["band_key"] in ("genuine", "likely_genuine")

        # Verify findings passed through
        assert len(result["findings"]) == 1
        assert result["findings"][0]["category"] == "metadata"

        # Verify counter-offer status
        assert result["counter_offer_analysis"]["status"] == "insufficient_inputs"

        # Verify the LLM was called exactly once
        mock_client.responses.create.assert_called_once()

    @patch("app.core.llm_client.OpenAI")
    def test_pipeline_with_counter_offer_inputs(self, mock_openai_class):
        """When counter-offer inputs are provided, the pipeline should
        pass them through and the post-processor should compute deltas."""
        # Build a richer mock response with counter-offer data
        co_output = dict(MOCK_LLM_OUTPUT)
        co_output["counter_offer_analysis"] = {
            "status": "complete",
            "hold_reason": None,
            "new_offer_extracted": {
                "issuer": "NewCo Inc",
                "designation": "Senior Engineer",
                "location": "Bengaluru",
                "work_mode_stated": "hybrid",
                "work_mode_evidence": "Page 1: 'flexible work arrangement, 3 days in office'",
                "fixed_ctc_annual_inr": 2400000,
                "variable_target_annual_inr": 600000,
                "one_time_items": [{"label": "Joining Bonus", "amount_inr": 200000}],
                "equity_notes": None,
                "total_ctc_annual_inr": 3000000,
                "employer_pf_included_in_ctc": "yes",
                "probation_terms": "6 months, 15-day notice during probation",
                "notice_terms": "90 days post-probation",
                "joining_date": "2024-04-01",
                "offer_deadline": "2024-03-15",
                "evidence_pages": [1, 2],
            },
            "new_company_profile": {
                "summary": "NewCo is a mid-size SaaS company.",
                "strengths": ["Strong brand", "Good culture"],
                "concerns": ["Recent layoffs"],
                "knowledge_confidence": "medium",
                "caveat": "Based on public information only.",
            },
            "factor_comparison": [
                {
                    "factor": "compensation",
                    "current": "₹20,00,000",
                    "new": "₹30,00,000",
                    "favours": "leave",
                    "weight": "high",
                    "reasoning": "50% total CTC uplift.",
                    "confidence": "high",
                },
            ],
            "retention_outlook": {
                "band": "likely_to_leave",
                "key_drivers": ["50% pay increase"],
                "unknowns": ["Manager relationship quality"],
                "rationale": "Significant pay gap makes retention difficult without substantial counter.",
            },
            "counter_offer_recommendation": {
                "should_counter": "yes",
                "reasoning": "The candidate is a high performer with a significant offer gap.",
                "uplift_pct_range": {"min": 30, "target": 40, "max": 50},
                "confidence": "medium",
                "non_monetary_levers": [
                    {
                        "lever": "Accelerated promotion",
                        "addresses_factor": "growth/title",
                        "rationale": "Promotion due; fast-tracking addresses career growth concern.",
                    }
                ],
                "risks": ["Internal equity compression"],
                "approvals_needed": ["Compensation committee"],
                "timing_note": "Offer deadline is March 15; counter must be presented by March 12.",
            },
            "inputs_missing": None,
        }

        content_item = MagicMock()
        content_item.text = json.dumps(co_output)
        output_item = MagicMock()
        output_item.content = [content_item]
        output_item.refusal = None
        usage = MagicMock()
        usage.input_tokens = 8000
        usage.output_tokens = 4000
        usage.output_tokens_details = MagicMock()
        usage.output_tokens_details.reasoning_tokens = 1500
        response = MagicMock()
        response.output = [output_item]
        response.usage = usage
        response.status = "completed"

        mock_client = MagicMock()
        mock_client.responses.create.return_value = response
        mock_openai_class.return_value = mock_client

        pdf_bytes = _make_minimal_pdf()
        counter_offer_inputs = {
            "current_fixed_ctc_inr": 1800000,
            "current_variable_target_inr": 200000,
            "role_title": "Engineer",
            "budget_ceiling_hike_pct": 35,
            "role_band_max_inr": 2800000,
        }

        result = analyze_document(
            pdf_bytes,
            context={"document_type": "Offer letter"},
            counter_offer_inputs=counter_offer_inputs,
        )

        co = result["counter_offer_analysis"]
        assert co["status"] == "complete"
        assert co["gated"] is False

        # Verify deltas were computed
        assert "deltas" in co
        assert co["deltas"]["fixed_delta_inr"] == 600000  # 2.4M - 1.8M

        # Verify uplift converted to rupees
        rec = co["counter_offer_recommendation"]
        assert "uplift_inr" in rec
        # target = 1.8M * 1.40 = 2.52M
        assert rec["uplift_inr"]["target_inr"] == 2520000

    @patch("app.core.llm_client.OpenAI")
    def test_pipeline_gating_low_score(self, mock_openai_class):
        """If authenticity_score < 4 and unverified, counter-offer
        should be gated (on hold)."""
        low_score_output = dict(MOCK_LLM_OUTPUT)
        low_score_output["fakeness_score"] = 75  # → authenticity 2.5
        low_score_output["confidence"] = "high"
        low_score_output["counter_offer_analysis"] = {
            "status": "complete",
            "hold_reason": None,
            "new_offer_extracted": None,
            "new_company_profile": None,
            "factor_comparison": None,
            "retention_outlook": None,
            "counter_offer_recommendation": None,
            "inputs_missing": None,
        }

        content_item = MagicMock()
        content_item.text = json.dumps(low_score_output)
        output_item = MagicMock()
        output_item.content = [content_item]
        output_item.refusal = None
        usage = MagicMock()
        usage.input_tokens = 5000
        usage.output_tokens = 1500
        usage.output_tokens_details = MagicMock()
        usage.output_tokens_details.reasoning_tokens = 600
        response = MagicMock()
        response.output = [output_item]
        response.usage = usage
        response.status = "completed"

        mock_client = MagicMock()
        mock_client.responses.create.return_value = response
        mock_openai_class.return_value = mock_client

        pdf_bytes = _make_minimal_pdf()
        result = analyze_document(
            pdf_bytes,
            counter_offer_inputs={"current_fixed_ctc_inr": 1000000},
        )

        # authenticity = (100-75)/10 = 2.5 < 4 → gated
        assert result["verdict"]["authenticity_score"] == 2.5
        co = result["counter_offer_analysis"]
        assert co["gated"] is True
        assert co["status"] == "on_hold_pending_verification"
