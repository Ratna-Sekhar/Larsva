"""
HRDocForensics — LLM client adapter.

Thin wrapper around the OpenAI Responses API so the model or provider
can be swapped later. Handles:
- Message assembly (context → metadata → signals → text → images)
- Structured output with JSON Schema from pydantic
- Retry logic for incomplete/schema-failure responses
- Cost tracking with reasoning token logging
- Optional tiering (fallback model for grey-zone scores)
"""

from __future__ import annotations

import json
import logging
import time
from typing import Any

from openai import OpenAI

from app.core.config import get_settings, load_system_prompt
from app.core.schemas import LLMForensicResult, generate_json_schema

logger = logging.getLogger("hrdocforensics.llm")


# ── Cost tracking ────────────────────────────────────────────────────

_daily_spend_usd: float = 0.0
_daily_spend_reset_day: int = 0


def _estimate_cost(usage: dict) -> float:
    """Estimate cost from usage dict. Rough per-MTok pricing for gpt-5.6-terra."""
    input_tokens = usage.get("input_tokens", 0)
    output_tokens = usage.get("output_tokens", 0)
    # Reasoning tokens are counted as output tokens
    reasoning_tokens = usage.get("output_tokens_details", {}).get("reasoning_tokens", 0)

    # Approximate pricing (USD per million tokens)
    input_price = 2.0   # $2/MTok input
    output_price = 12.0  # $12/MTok output (including reasoning)

    cost = (input_tokens / 1_000_000) * input_price + (output_tokens / 1_000_000) * output_price
    return round(cost, 6)


def _check_spend_cap(estimated_cost: float) -> bool:
    """Check if adding this cost would exceed the daily spend cap."""
    global _daily_spend_usd, _daily_spend_reset_day
    import datetime
    today = datetime.date.today().toordinal()
    if today != _daily_spend_reset_day:
        _daily_spend_usd = 0.0
        _daily_spend_reset_day = today

    settings = get_settings()
    return (_daily_spend_usd + estimated_cost) <= settings.daily_spend_cap_usd


def _record_spend(cost: float) -> None:
    global _daily_spend_usd
    _daily_spend_usd += cost


# ── Message assembly ─────────────────────────────────────────────────


def _build_messages(
    metadata: dict[str, Any],
    signals: dict[str, Any],
    rendered: dict[str, Any],
    context: dict[str, Any] | None = None,
    counter_offer_inputs: dict[str, Any] | None = None,
    factor_weights: dict[str, str] | None = None,
) -> list[dict]:
    """Build the user message with text + images in the spec order:

    1. Authenticity context
    2. Counter-offer inputs + factor_weights
    3. Metadata JSON
    4. Signals JSON
    5. Extracted text per page
    6. Page images (each preceded by its label)
    """
    content_parts: list[dict] = []

    # 1. Authenticity context
    if context:
        content_parts.append({
            "type": "input_text",
            "text": f"## Authenticity Context\n```json\n{json.dumps(context, indent=2)}\n```",
        })

    # 2. Counter-offer inputs + factor weights
    if counter_offer_inputs:
        co_section = {**counter_offer_inputs}
        if factor_weights:
            co_section["factor_weights"] = factor_weights
        content_parts.append({
            "type": "input_text",
            "text": f"## Counter-Offer Inputs\n```json\n{json.dumps(co_section, indent=2, default=str)}\n```",
        })

    # 3. Metadata JSON (exclude text_per_page, sent separately)
    meta_for_llm = {k: v for k, v in metadata.items() if k != "text_per_page"}
    content_parts.append({
        "type": "input_text",
        "text": f"## PDF Metadata\n```json\n{json.dumps(meta_for_llm, indent=2, default=str)}\n```",
    })

    # 4. Signals JSON
    content_parts.append({
        "type": "input_text",
        "text": f"## Computed Signals\n```json\n{json.dumps(signals, indent=2, default=str)}\n```",
    })

    # 5. Extracted text per page
    text_per_page = metadata.get("text_per_page", [])
    if text_per_page:
        text_sections = []
        for i, text in enumerate(text_per_page):
            if text.strip():
                text_sections.append(f"### Page {i + 1}\n{text}")
            else:
                text_sections.append(f"### Page {i + 1}\n[No extractable text — scanned or image page]")
        content_parts.append({
            "type": "input_text",
            "text": f"## Extracted Text Per Page\n\n" + "\n\n".join(text_sections),
        })

    # 6. Skipped pages notice
    skipped = rendered.get("skipped_pages", [])
    if skipped:
        content_parts.append({
            "type": "input_text",
            "text": (
                f"**Note:** Pages {skipped} were not rendered due to the page cap. "
                f"Analysis of those pages relies on extracted text only."
            ),
        })

    # 7. Page images
    for img in rendered.get("images", []):
        content_parts.append({
            "type": "input_text",
            "text": img["label"],
        })
        content_parts.append({
            "type": "input_image",
            "image_url": f"data:image/png;base64,{img['base64_png']}",
            "detail": img["detail_level"],
        })

    return [
        {"role": "developer", "content": load_system_prompt()},
        {"role": "user", "content": content_parts},
    ]


# ── LLM call ─────────────────────────────────────────────────────────


class LLMError(Exception):
    """Raised when the LLM call fails after retries."""
    pass


class SpendCapError(Exception):
    """Raised when the daily spend cap is reached."""
    pass


def call_llm(
    metadata: dict[str, Any],
    signals: dict[str, Any],
    rendered: dict[str, Any],
    context: dict[str, Any] | None = None,
    counter_offer_inputs: dict[str, Any] | None = None,
    factor_weights: dict[str, str] | None = None,
    model_override: str | None = None,
) -> tuple[LLMForensicResult, dict[str, Any]]:
    """Make the single LLM call and return validated result + usage info.

    Returns:
        (result, usage_info) where usage_info contains token counts and cost.

    Raises:
        LLMError: on refusal, repeated failures, or unrecoverable errors.
        SpendCapError: when the daily spend cap would be exceeded.
    """
    settings = get_settings()
    client = OpenAI(api_key=settings.openai_api_key)
    model = model_override or settings.llm_model
    schema = generate_json_schema()

    messages = _build_messages(
        metadata, signals, rendered, context, counter_offer_inputs, factor_weights,
    )

    max_output_tokens = settings.max_output_tokens
    max_retries = 2  # one retry for incomplete, one for schema failure

    for attempt in range(max_retries + 1):
        # Pre-flight spend check (rough estimate)
        if not _check_spend_cap(0.20):  # Conservative pre-check
            raise SpendCapError(
                "Daily spend cap reached. Try again tomorrow or increase DAILY_SPEND_CAP_USD."
            )

        try:
            t0 = time.monotonic()
            response = client.responses.create(
                model=model,
                input=messages,
                text={
                    "format": {
                        "type": "json_schema",
                        "name": "forensic_analysis",
                        "schema": schema,
                        "strict": True,
                    }
                },
                reasoning={"effort": settings.reasoning_effort},
                max_output_tokens=max_output_tokens,
            )
            elapsed = time.monotonic() - t0

        except Exception as e:
            logger.error(f"LLM API error on attempt {attempt + 1}: {e}")
            if attempt == max_retries:
                raise LLMError(f"LLM API call failed after {max_retries + 1} attempts: {e}")
            continue

        # Extract usage info
        usage = {}
        if hasattr(response, "usage") and response.usage:
            usage = {
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
                "output_tokens_details": {},
                "elapsed_seconds": round(elapsed, 2),
            }
            if hasattr(response.usage, "output_tokens_details") and response.usage.output_tokens_details:
                details = response.usage.output_tokens_details
                usage["output_tokens_details"] = {
                    "reasoning_tokens": getattr(details, "reasoning_tokens", 0),
                }

        cost = _estimate_cost(usage)
        usage["estimated_cost_usd"] = cost
        _record_spend(cost)

        logger.info(
            f"LLM call attempt {attempt + 1}: model={model}, "
            f"input_tokens={usage.get('input_tokens', '?')}, "
            f"output_tokens={usage.get('output_tokens', '?')}, "
            f"reasoning_tokens={usage.get('output_tokens_details', {}).get('reasoning_tokens', '?')}, "
            f"cost=${cost:.4f}, elapsed={elapsed:.1f}s"
        )

        # Check for refusal
        if hasattr(response, "output") and response.output:
            first_output = response.output[0] if response.output else None
            if first_output and hasattr(first_output, "refusal") and first_output.refusal:
                raise LLMError(f"LLM refused the request: {first_output.refusal}")

        # Check response status
        status = getattr(response, "status", "completed")
        if status == "incomplete":
            reason = getattr(response, "incomplete_details", {})
            logger.warning(f"Response incomplete: {reason}. Retrying with higher token limit.")
            if attempt < max_retries:
                max_output_tokens = int(max_output_tokens * 1.5)
                continue
            else:
                raise LLMError(
                    "LLM response was truncated (output token limit hit) "
                    "even after retry. Increase MAX_OUTPUT_TOKENS."
                )

        # Parse the structured output
        try:
            output_text = None
            if hasattr(response, "output") and response.output:
                for item in response.output:
                    if hasattr(item, "content") and item.content:
                        for content_item in item.content:
                            if hasattr(content_item, "text"):
                                output_text = content_item.text
                                break

            if not output_text:
                if attempt < max_retries:
                    logger.warning("Empty LLM output, retrying.")
                    continue
                raise LLMError("LLM returned empty output after retries.")

            parsed = json.loads(output_text)
            result = LLMForensicResult.model_validate(parsed)
            return result, usage

        except (json.JSONDecodeError, Exception) as e:
            logger.warning(f"Schema/validation error on attempt {attempt + 1}: {e}")
            if attempt < max_retries:
                continue
            raise LLMError(f"LLM output failed validation after retries: {e}")

    raise LLMError("Exhausted all retry attempts.")


# ── Optional tiering ─────────────────────────────────────────────────


def call_llm_with_tiering(
    metadata: dict[str, Any],
    signals: dict[str, Any],
    rendered: dict[str, Any],
    context: dict[str, Any] | None = None,
    counter_offer_inputs: dict[str, Any] | None = None,
    factor_weights: dict[str, str] | None = None,
) -> tuple[LLMForensicResult, dict[str, Any]]:
    """Call the primary model, then optionally re-run on the fallback
    model if the result is in the grey zone (fakeness 21-79) or low
    confidence.
    """
    settings = get_settings()

    result, usage = call_llm(
        metadata, signals, rendered, context, counter_offer_inputs, factor_weights,
    )

    # Optional tiering: re-run on fallback model for grey-zone results
    if settings.llm_fallback_model:
        is_grey_zone = 21 <= result.fakeness_score <= 79
        is_low_confidence = result.confidence == "low"

        if is_grey_zone or is_low_confidence:
            logger.info(
                f"Grey zone (score={result.fakeness_score}, confidence={result.confidence}). "
                f"Re-running on fallback model: {settings.llm_fallback_model}"
            )
            try:
                result, usage = call_llm(
                    metadata, signals, rendered, context, counter_offer_inputs,
                    factor_weights, model_override=settings.llm_fallback_model,
                )
                usage["tiered"] = True
                usage["fallback_model"] = settings.llm_fallback_model
            except (LLMError, SpendCapError) as e:
                logger.warning(f"Fallback model failed, using primary result: {e}")
                usage["tiered_attempted"] = True
                usage["tiered_error"] = str(e)

    return result, usage
