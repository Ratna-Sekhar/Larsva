"""
HRDocForensics — PDF page rendering to images.

Renders pages to PNG using PyMuPDF (fitz) with DPI and resolution rules:
- Flagged pages + page 1 + last page: 200 DPI, 2000px max edge
- Other pages: RENDER_DPI, MAX_IMAGE_EDGE_PX
- Caps at MAX_PAGES; for longer docs takes first 15 + last 5.
"""

from __future__ import annotations

import base64
from io import BytesIO
from typing import Any

import fitz  # PyMuPDF
from PIL import Image

from app.core.config import get_settings


def _render_page(
    page: fitz.Page,
    dpi: int,
    max_edge_px: int,
) -> str:
    """Render a single fitz.Page to a base64-encoded PNG string.

    Scales so the longer edge is at most max_edge_px.
    """
    # Calculate zoom factor from DPI (72 dpi = 1x)
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False)

    # Scale down if longer edge exceeds max
    w, h = pix.width, pix.height
    long_edge = max(w, h)
    if long_edge > max_edge_px:
        scale = max_edge_px / long_edge
        new_w = int(w * scale)
        new_h = int(h * scale)
        img = Image.frombytes("RGB", (w, h), pix.samples)
        img = img.resize((new_w, new_h), Image.LANCZOS)
    else:
        img = Image.frombytes("RGB", (w, h), pix.samples)

    # Encode to PNG bytes, then base64
    buf = BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return base64.b64encode(buf.getvalue()).decode("ascii")


def render_pages(
    pdf_bytes: bytes,
    flagged_pages: list[int],
) -> dict[str, Any]:
    """Render PDF pages to base64 PNG images with metadata labels.

    Args:
        pdf_bytes: Raw PDF file bytes.
        flagged_pages: 1-indexed page numbers that have anomalies.

    Returns:
        {
            "images": [
                {
                    "page_number": int,       # 1-indexed
                    "label": str,             # "Page 3 of 12"
                    "base64_png": str,
                    "is_flagged": bool,       # True for flagged/p1/last
                    "detail_level": str,      # "high" or config default
                }
            ],
            "total_pages": int,
            "rendered_pages": list[int],
            "skipped_pages": list[int],
        }
    """
    settings = get_settings()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    total = len(doc)

    # Determine which pages to render
    max_pages = settings.max_pages
    if total <= max_pages:
        pages_to_render = list(range(1, total + 1))
        skipped = []
    else:
        first_n = min(15, max_pages - 5)
        last_n = max_pages - first_n
        first_set = list(range(1, first_n + 1))
        last_set = list(range(total - last_n + 1, total + 1))
        pages_to_render = sorted(set(first_set + last_set))
        skipped = [p for p in range(1, total + 1) if p not in pages_to_render]

    # Determine high-priority pages: page 1, last page, flagged pages
    high_priority = set(flagged_pages)
    high_priority.add(1)
    high_priority.add(total)

    # High-res settings for priority pages
    hi_dpi = 200
    hi_max_edge = 2000
    lo_dpi = settings.render_dpi
    lo_max_edge = settings.max_image_edge_px

    images: list[dict[str, Any]] = []
    for page_num in pages_to_render:
        page = doc[page_num - 1]  # fitz is 0-indexed
        is_priority = page_num in high_priority

        dpi = hi_dpi if is_priority else lo_dpi
        max_edge = hi_max_edge if is_priority else lo_max_edge

        b64 = _render_page(page, dpi, max_edge)

        images.append({
            "page_number": page_num,
            "label": f"Page {page_num} of {total}",
            "base64_png": b64,
            "is_flagged": page_num in set(flagged_pages),
            "detail_level": settings.image_detail_flagged if is_priority else settings.image_detail_default,
        })

    doc.close()

    return {
        "images": images,
        "total_pages": total,
        "rendered_pages": pages_to_render,
        "skipped_pages": skipped,
    }
