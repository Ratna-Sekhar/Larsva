"""
HRDocForensics — Pipeline orchestrator.

Ties together: validate → extract metadata → compute signals →
render pages → LLM call → score → post-process → result.
"""

from __future__ import annotations

import hashlib
import logging
from typing import Any

from app.core.metadata import extract_metadata
from app.core.signals import compute_signals
from app.core.renderer import render_pages
from app.core.llm_client import call_llm_with_tiering, LLMError, SpendCapError
from app.core.scoring import build_verdict
from app.core.counter_offer import post_process_counter_offer, resolve_factor_weights

logger = logging.getLogger("hrdocforensics.pipeline")


def validate_pdf_bytes(pdf_bytes: bytes, max_mb: int) -> None:
    """Validate PDF magic bytes and size."""
    if not pdf_bytes[:5] == b"%PDF-":
        raise ValueError("File is not a valid PDF (magic bytes check failed).")
    max_bytes = max_mb * 1024 * 1024
    if len(pdf_bytes) > max_bytes:
        raise ValueError(f"File exceeds the {max_mb} MB upload limit.")


def analyze_document(
    pdf_bytes: bytes,
    context: dict[str, Any] | None = None,
    counter_offer_inputs: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Run the full analysis pipeline on a PDF document.

    Args:
        pdf_bytes: Raw PDF file bytes (already validated).
        context: Optional authenticity context (document_type, claimed_issuer, etc.)
        counter_offer_inputs: Optional counter-offer HR inputs.

    Returns:
        Complete result dict with verdict, findings, counter-offer analysis,
        metadata, and signals.
    """
    expected_tz = (context or {}).get("expected_timezone", "Asia/Kolkata")
    hr_confirms = (counter_offer_inputs or {}).get("hr_confirms_offer_verified", False)
    candidate_priorities = (counter_offer_inputs or {}).get("candidate_priorities")

    # Step 1: Extract metadata
    logger.info("Step 1: Extracting metadata...")
    metadata = extract_metadata(pdf_bytes)

    # Step 2: Compute signals
    logger.info("Step 2: Computing forensic signals...")
    signals = compute_signals(pdf_bytes, metadata, expected_tz)

    # Step 3: Render pages
    logger.info("Step 3: Rendering pages...")
    rendered = render_pages(pdf_bytes, signals["flagged_pages"])

    # Step 4: Resolve factor weights
    factor_weights = resolve_factor_weights(candidate_priorities)

    # Step 5: LLM call
    logger.info("Step 4: Making LLM call...")
    llm_result, usage = call_llm_with_tiering(
        metadata=metadata,
        signals=signals,
        rendered=rendered,
        context=context,
        counter_offer_inputs=counter_offer_inputs,
        factor_weights=factor_weights,
    )

    # Step 6: Score conversion
    logger.info("Step 5: Computing verdict...")
    verdict = build_verdict(llm_result.fakeness_score, llm_result.confidence)

    # Step 7: Counter-offer post-processing
    logger.info("Step 6: Post-processing counter-offer...")
    counter_offer = post_process_counter_offer(
        llm_result=llm_result,
        authenticity_score=verdict["authenticity_score"],
        counter_offer_inputs=counter_offer_inputs,
        hr_confirms_verified=hr_confirms,
    )

    # Assemble final result
    result = {
        "verdict": verdict,
        "summary": llm_result.summary,
        "findings": [f.model_dump() for f in llm_result.findings],
        "checks_passed": llm_result.checks_passed,
        "limitations": llm_result.limitations,
        "counter_offer_analysis": counter_offer,
        "metadata": {
            k: v for k, v in metadata.items()
            if k != "text_per_page"  # Don't return full text in API response
        },
        "signals": signals,
        "usage": usage,
    }

    return result


def compare_hashes(file1_bytes: bytes, file2_bytes: bytes) -> dict[str, Any]:
    """Compare SHA-256 hashes of two PDFs and provide text diff if different.

    Used for the verification flow: candidate re-downloads the offer
    letter and HR compares it with the original.
    """
    hash1 = hashlib.sha256(file1_bytes).hexdigest()
    hash2 = hashlib.sha256(file2_bytes).hexdigest()

    result: dict[str, Any] = {
        "match": hash1 == hash2,
        "hash1": hash1,
        "hash2": hash2,
    }

    if not result["match"]:
        # Provide per-page text diff
        from app.core.metadata import _extract_text_per_page
        text1 = _extract_text_per_page(file1_bytes)
        text2 = _extract_text_per_page(file2_bytes)

        diffs: list[dict[str, Any]] = []
        max_pages = max(len(text1), len(text2))
        for i in range(max_pages):
            t1 = text1[i] if i < len(text1) else "[page missing]"
            t2 = text2[i] if i < len(text2) else "[page missing]"
            if t1 != t2:
                diffs.append({
                    "page": i + 1,
                    "file1_text": t1[:500],
                    "file2_text": t2[:500],
                    "identical": False,
                })
            else:
                diffs.append({"page": i + 1, "identical": True})

        result["page_diffs"] = diffs
        result["pages_different"] = sum(1 for d in diffs if not d.get("identical"))

    return result
