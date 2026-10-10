"""
HRDocForensics — Forensic signal computation.

All signals here are DETERMINISTIC (no LLM). They are FACTS passed to
the LLM so it can weigh them — code never decides the verdict.
"""

from __future__ import annotations

import re
from typing import Any

import pdfplumber
from io import BytesIO

from app.core.config import load_producers_yaml


# ═══════════════════════════════════════════════════════════════════════
# 1. TEXT-LAYER ORDER ANOMALIES
# ═══════════════════════════════════════════════════════════════════════
#
# When someone edits a PDF to replace a name, date, or amount, the
# replacement text is appended to the end of the page's content stream
# but drawn at the visual position of the original text. This means:
#   - content-stream order: the new text is LAST
#   - visual (y-coordinate) order: the new text is at the TOP or MIDDLE
#
# A legitimate document generated in one pass has content-stream order
# that roughly matches top-to-bottom visual order. Anomalies here are
# invisible in rendered images, so this signal is critical.
# ═══════════════════════════════════════════════════════════════════════


def _compute_text_layer_order_anomalies(
    pdf_bytes: bytes,
) -> list[dict[str, Any]]:
    """Detect text lines whose content-stream index diverges from visual
    top-to-bottom order, which is a strong sign of overlaid/replaced text.

    Uses pdfplumber which preserves both the character extraction order
    (content-stream order) and the y-coordinate (visual position).
    """
    anomalies: list[dict[str, Any]] = []

    try:
        with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
            for page_idx, page in enumerate(pdf.pages):
                chars = page.chars
                if not chars:
                    continue

                # Group characters into lines by rounding y-coordinate
                # (top of char bounding box). Characters on the same line
                # share approximately the same "top" value.
                lines: list[dict[str, Any]] = []
                current_line_chars: list[dict] = []
                current_y: float | None = None
                y_tolerance = 3.0  # points

                for char in chars:
                    char_y = round(char["top"], 1)
                    if current_y is None or abs(char_y - current_y) > y_tolerance:
                        if current_line_chars:
                            text = "".join(c["text"] for c in current_line_chars).strip()
                            if text:
                                lines.append({
                                    "text": text,
                                    "visual_y": current_y,
                                    "stream_start_idx": current_line_chars[0].get("_char_index", 0),
                                })
                        current_line_chars = [char]
                        current_y = char_y
                    else:
                        current_line_chars.append(char)

                # Flush last line
                if current_line_chars:
                    text = "".join(c["text"] for c in current_line_chars).strip()
                    if text:
                        lines.append({
                            "text": text,
                            "visual_y": current_y,
                            "stream_start_idx": current_line_chars[0].get("_char_index", 0),
                        })

                if len(lines) < 3:
                    continue  # Too few lines to compare

                # Assign stream index based on extraction order (already in
                # content-stream order from pdfplumber)
                for stream_idx, line in enumerate(lines):
                    line["stream_index"] = stream_idx

                # Sort by visual y (top of page = smallest y value)
                visual_order = sorted(lines, key=lambda l: l["visual_y"])
                for vis_idx, line in enumerate(visual_order):
                    line["visual_index"] = vis_idx

                # Look for lines where stream_index is very different from
                # visual_index — e.g. stream index near the end but
                # visual index near the top.
                n = len(lines)
                for line in lines:
                    si = line["stream_index"]
                    vi = line["visual_index"]
                    # Significant if the line is in the bottom 25% of stream
                    # order but the top 50% of visual order, or vice versa
                    stream_pct = si / n
                    visual_pct = vi / n

                    # A line appended at the end of the stream (stream_pct > 0.75)
                    # but displayed in the top half of the page (visual_pct < 0.5)
                    # is suspicious.
                    if stream_pct > 0.75 and visual_pct < 0.5:
                        anomalies.append({
                            "page": page_idx + 1,
                            "line_text": line["text"][:120],
                            "stream_index": si,
                            "visual_index": vi,
                            "total_lines": n,
                            "detail": (
                                f"Line is #{si+1} in content stream "
                                f"(of {n}) but appears at visual position "
                                f"#{vi+1} from top. Late-stream text "
                                f"drawn high on the page suggests overlay."
                            ),
                        })
                    # Also flag: very early stream order but very late visual
                    # (less common, but could indicate deleted+re-added text)
                    elif stream_pct < 0.25 and visual_pct > 0.75 and n > 6:
                        anomalies.append({
                            "page": page_idx + 1,
                            "line_text": line["text"][:120],
                            "stream_index": si,
                            "visual_index": vi,
                            "total_lines": n,
                            "detail": (
                                f"Line is #{si+1} in content stream "
                                f"(of {n}) but appears at visual position "
                                f"#{vi+1} from top. Early-stream text "
                                f"drawn low on the page is unusual."
                            ),
                        })

    except Exception:
        pass  # If pdfplumber fails, return empty — signal absent, not errored

    return anomalies


# ═══════════════════════════════════════════════════════════════════════
# 2. FONT ANOMALIES
# ═══════════════════════════════════════════════════════════════════════


def _compute_font_anomalies(
    pdf_bytes: bytes,
) -> list[dict[str, Any]]:
    """Detect mixed font families or sizes within lines/paragraphs.

    Uses pdfplumber's character-level data to spot mid-line font changes
    that could indicate text replacement.
    """
    anomalies: list[dict[str, Any]] = []

    try:
        with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
            for page_idx, page in enumerate(pdf.pages):
                chars = page.chars
                if not chars:
                    continue

                # Group chars into lines by y-coordinate
                current_line_chars: list[dict] = []
                current_y: float | None = None
                y_tolerance = 3.0
                lines_data: list[list[dict]] = []

                for char in chars:
                    char_y = round(char["top"], 1)
                    if current_y is None or abs(char_y - current_y) > y_tolerance:
                        if current_line_chars:
                            lines_data.append(current_line_chars)
                        current_line_chars = [char]
                        current_y = char_y
                    else:
                        current_line_chars.append(char)
                if current_line_chars:
                    lines_data.append(current_line_chars)

                for line_chars in lines_data:
                    if len(line_chars) < 3:
                        continue

                    # Collect unique (fontname, size) combos in this line
                    font_combos: set[tuple[str, float]] = set()
                    for c in line_chars:
                        if c["text"].strip():
                            fn = c.get("fontname", "")
                            sz = round(c.get("size", 0), 1)
                            font_combos.add((fn, sz))

                    if len(font_combos) > 2:
                        line_text = "".join(c["text"] for c in line_chars).strip()
                        if line_text:
                            families = sorted(set(f[0] for f in font_combos))
                            sizes = sorted(set(f[1] for f in font_combos))
                            anomalies.append({
                                "page": page_idx + 1,
                                "line_text": line_text[:120],
                                "font_families": families,
                                "font_sizes": sizes,
                                "detail": (
                                    f"Line has {len(font_combos)} font/size "
                                    f"combinations: {', '.join(f'{f}@{s}pt' for f, s in sorted(font_combos))}."
                                ),
                            })

    except Exception:
        pass

    return anomalies


# ═══════════════════════════════════════════════════════════════════════
# 3. DATE ANOMALIES
# ═══════════════════════════════════════════════════════════════════════


def _compute_date_anomalies(
    metadata: dict[str, Any],
    expected_timezone: str = "Asia/Kolkata",
) -> list[dict[str, str]]:
    """Check for suspicious date patterns in metadata."""
    anomalies: list[dict[str, str]] = []

    creation = metadata.get("creation_date", {})
    modification = metadata.get("mod_date", {})

    c_iso = creation.get("datetime_iso")
    m_iso = modification.get("datetime_iso")

    # ModDate later than CreationDate
    if c_iso and m_iso:
        try:
            from datetime import datetime as dt
            # Simple string comparison works for ISO format
            if m_iso > c_iso:
                anomalies.append({
                    "type": "mod_after_creation",
                    "detail": (
                        f"ModDate ({modification.get('date')} {modification.get('time')}) "
                        f"is later than CreationDate ({creation.get('date')} {creation.get('time')}). "
                        f"This can indicate editing after initial creation."
                    ),
                })
        except Exception:
            pass

    # ModDate present with no CreationDate
    if m_iso and not c_iso:
        anomalies.append({
            "type": "mod_without_creation",
            "detail": "ModDate is present but CreationDate is missing. The original creation timestamp was removed.",
        })

    # Timezone offset check
    expected_offsets = {
        "Asia/Kolkata": 5.5,
        "Asia/Calcutta": 5.5,
    }
    expected_offset = expected_offsets.get(expected_timezone)

    for label, date_info in [("CreationDate", creation), ("ModDate", modification)]:
        tz_hours = date_info.get("tz_offset_hours")
        if tz_hours is not None and expected_offset is not None:
            if abs(tz_hours - expected_offset) > 0.5:
                anomalies.append({
                    "type": "timezone_mismatch",
                    "detail": (
                        f"{label} timezone offset is {date_info.get('tz_offset_str')} "
                        f"(UTC{'+' if tz_hours >= 0 else ''}{tz_hours}), "
                        f"but the expected timezone {expected_timezone} is "
                        f"UTC+{expected_offset}."
                    ),
                })

    return anomalies


# ═══════════════════════════════════════════════════════════════════════
# 4. PRODUCER CLASSIFICATION
# ═══════════════════════════════════════════════════════════════════════


def _classify_producer(metadata: dict[str, Any]) -> dict[str, str]:
    """Classify Producer and Creator strings using config/producers.yaml."""
    producers_config = load_producers_yaml()

    result: dict[str, str] = {
        "producer_class": "unknown",
        "creator_class": "unknown",
        "producer_raw": metadata.get("producer") or "",
        "creator_raw": metadata.get("creator") or "",
    }

    for field, class_key in [("producer", "producer_class"), ("creator", "creator_class")]:
        raw = (metadata.get(field) or "").lower()
        if not raw:
            result[class_key] = "unknown"
            continue

        for category, substrings in producers_config.items():
            for substr in substrings:
                if substr in raw:
                    result[class_key] = category
                    break
            if result[class_key] != "unknown":
                break

    return result


# ═══════════════════════════════════════════════════════════════════════
# 5. FLAG CONFLICTS
# ═══════════════════════════════════════════════════════════════════════


def _compute_flag_conflicts(metadata: dict[str, Any]) -> list[dict[str, str]]:
    """Detect contradictions between metadata flags."""
    conflicts: list[dict[str, str]] = []

    acroform = metadata.get("acroform", {})
    if acroform.get("has_acroform") and acroform.get("field_count", 0) == 0:
        conflicts.append({
            "type": "acroform_no_fields",
            "detail": "AcroForm is present in the document catalog but contains zero form fields.",
        })

    # Unembedded fonts
    unembedded = []
    for font in metadata.get("all_fonts", []):
        if not font.get("embedded"):
            unembedded.append(font.get("name", "?"))
    if unembedded:
        conflicts.append({
            "type": "unembedded_fonts",
            "detail": f"The following fonts are not embedded: {', '.join(unembedded[:10])}. This can cause rendering differences across systems.",
        })

    return conflicts


# ═══════════════════════════════════════════════════════════════════════
# 6. TEXT EXTRACTABILITY
# ═══════════════════════════════════════════════════════════════════════


def _check_text_extractable(metadata: dict[str, Any]) -> dict[str, Any]:
    """Check whether a usable text layer exists."""
    text_per_page = metadata.get("text_per_page", [])
    pages_with_text = sum(1 for t in text_per_page if t.strip())
    total_pages = metadata.get("page_count", 0)

    if pages_with_text == 0:
        return {
            "text_extractable": False,
            "detail": "No text layer found. This is a scanned/image-only PDF. Font and text-layer checks are not possible.",
        }
    elif pages_with_text < total_pages:
        return {
            "text_extractable": True,
            "partially_scanned": True,
            "pages_with_text": pages_with_text,
            "detail": f"Text found on {pages_with_text}/{total_pages} pages. Some pages may be scanned images.",
        }
    else:
        return {
            "text_extractable": True,
            "detail": f"Text layer present on all {total_pages} pages.",
        }


# ═══════════════════════════════════════════════════════════════════════
# MAIN: compute_signals
# ═══════════════════════════════════════════════════════════════════════


def compute_signals(
    pdf_bytes: bytes,
    metadata: dict[str, Any],
    expected_timezone: str = "Asia/Kolkata",
) -> dict[str, Any]:
    """Compute all forensic signals from PDF bytes and extracted metadata.

    Returns a dict of signals, each containing evidence detail.
    These are FACTS for the LLM — code never decides the verdict.
    """
    # 1. Text-layer order anomalies (the most important signal)
    text_order_anomalies = _compute_text_layer_order_anomalies(pdf_bytes)

    # 2. Font anomalies
    font_anomalies = _compute_font_anomalies(pdf_bytes)

    # 3. Date anomalies
    date_anomalies = _compute_date_anomalies(metadata, expected_timezone)

    # 4. Producer classification
    producer_class = _classify_producer(metadata)

    # 5. Flag conflicts
    flag_conflicts = _compute_flag_conflicts(metadata)

    # 6. Text extractability
    text_extractable = _check_text_extractable(metadata)

    # 7. Flagged pages: any page with an anomaly
    flagged_pages: set[int] = set()
    for a in text_order_anomalies:
        flagged_pages.add(a["page"])
    for a in font_anomalies:
        flagged_pages.add(a["page"])

    return {
        "text_layer_order_anomalies": text_order_anomalies,
        "font_anomalies": font_anomalies,
        "date_anomalies": date_anomalies,
        "producer_class": producer_class,
        "flag_conflicts": flag_conflicts,
        "text_extractable": text_extractable,
        "flagged_pages": sorted(flagged_pages),
    }
