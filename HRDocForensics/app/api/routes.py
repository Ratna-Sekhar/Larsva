"""
HRDocForensics — API routes.

POST /api/hrdocforensics/analyze
POST /api/hrdocforensics/compare-hash
GET  /api/hrdocforensics/health
"""

from __future__ import annotations

import json
import logging
import tempfile
import time
from collections import defaultdict
from typing import Any

from fastapi import APIRouter, File, Form, UploadFile, HTTPException, Request
from pydantic import ValidationError

from app.api import AuthenticityContext, CounterOfferInputs
from app.core.config import get_settings
from app.core.pipeline import validate_pdf_bytes, analyze_document, compare_hashes
from app.core.llm_client import LLMError, SpendCapError

logger = logging.getLogger("hrdocforensics.api")

router = APIRouter(prefix="/api/hrdocforensics")

# Simple in-memory rate limiter
_rate_counts: dict[str, list[float]] = defaultdict(list)


def _check_rate_limit(client_ip: str) -> bool:
    """Check per-IP rate limit."""
    settings = get_settings()
    now = time.time()
    hour_ago = now - 3600
    # Clean old entries
    _rate_counts[client_ip] = [t for t in _rate_counts[client_ip] if t > hour_ago]
    if len(_rate_counts[client_ip]) >= settings.rate_limit_per_ip_per_hour:
        return False
    _rate_counts[client_ip].append(now)
    return True


# ── Health ───────────────────────────────────────────────────────────


@router.get("/health")
async def health():
    return {"status": "ok", "service": "HRDocForensics"}


# ── Analyze ──────────────────────────────────────────────────────────


@router.post("/analyze")
async def analyze(
    request: Request,
    file: UploadFile = File(...),
    context: str | None = Form(None),
    counter_offer_inputs: str | None = Form(None),
):
    """Analyze a PDF document for authenticity and counter-offer insights.

    - file: PDF upload (multipart)
    - context: JSON string of AuthenticityContext (optional)
    - counter_offer_inputs: JSON string of CounterOfferInputs (optional)
    """
    client_ip = request.client.host if request.client else "unknown"

    # Rate limit
    if not _check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Try again later.",
        )

    settings = get_settings()

    # Read and validate file
    pdf_bytes = await file.read()
    try:
        validate_pdf_bytes(pdf_bytes, settings.max_upload_mb)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Parse context
    parsed_context: dict[str, Any] | None = None
    if context:
        try:
            raw = json.loads(context)
            validated = AuthenticityContext.model_validate(raw)
            parsed_context = validated.model_dump(exclude_none=True)
        except (json.JSONDecodeError, ValidationError) as e:
            raise HTTPException(status_code=422, detail=f"Invalid context: {e}")

    # Parse counter-offer inputs
    parsed_co: dict[str, Any] | None = None
    if counter_offer_inputs:
        try:
            raw = json.loads(counter_offer_inputs)
            validated = CounterOfferInputs.model_validate(raw)
            parsed_co = validated.model_dump(exclude_none=True)
        except (json.JSONDecodeError, ValidationError) as e:
            raise HTTPException(status_code=422, detail=f"Invalid counter-offer inputs: {e}")

    # Run pipeline
    try:
        result = analyze_document(pdf_bytes, parsed_context, parsed_co)
    except SpendCapError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except LLMError as e:
        logger.error(f"LLM error: {e}")
        raise HTTPException(status_code=502, detail=f"Analysis failed: {e}")
    except Exception as e:
        logger.exception("Unexpected error during analysis")
        raise HTTPException(status_code=500, detail="Internal error during analysis.")

    # Privacy: do not log document text, images, names, or HR inputs
    logger.info(
        f"Analysis complete: score={result['verdict']['authenticity_score']}, "
        f"band={result['verdict']['band_key']}"
    )

    return result


# ── Compare Hash ─────────────────────────────────────────────────────


@router.post("/compare-hash")
async def compare_hash(
    request: Request,
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
):
    """Compare SHA-256 hashes of two PDF files.

    If they differ, shows a per-page text diff.
    """
    client_ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded.")

    settings = get_settings()

    bytes1 = await file1.read()
    bytes2 = await file2.read()

    for label, b in [("File 1", bytes1), ("File 2", bytes2)]:
        try:
            validate_pdf_bytes(b, settings.max_upload_mb)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"{label}: {e}")

    result = compare_hashes(bytes1, bytes2)
    return result
