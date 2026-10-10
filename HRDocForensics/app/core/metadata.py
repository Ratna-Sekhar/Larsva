"""
HRDocForensics — PDF metadata extraction.

Wraps and extends the existing DocForensics/app.py extraction functions.
Returns a structured dict consumed by signals.py and the LLM prompt.
"""

from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone, timedelta
from io import BytesIO
from typing import Any

import pdfplumber
from pypdf import PdfReader


# ── Helpers ported from DocForensics/app.py ──────────────────────────


def _safe_get(meta: dict, key: str) -> str | None:
    """Safely retrieve a metadata value, returning None for missing/empty."""
    value = meta.get(key, None)
    if value is None:
        return None
    s = str(value).strip()
    return s if s else None


def _parse_pdf_date_raw(raw: str | None) -> dict[str, Any]:
    """Parse a PDF date string (D:YYYYMMDDHHmmSS±HH'mm') into components.

    Returns {raw, date, time, datetime_iso, tz_offset_str, tz_offset_hours}.
    Preserves timezone info (the original code stripped it).
    """
    result: dict[str, Any] = {
        "raw": raw,
        "date": None,
        "time": None,
        "datetime_iso": None,
        "tz_offset_str": None,
        "tz_offset_hours": None,
    }
    if not raw:
        return result

    s = str(raw).strip()
    if s.startswith("D:"):
        s = s[2:]

    # Extract timezone offset before stripping it
    tz_match = re.search(r"([Z+\-])(\d{2})'?(\d{2})?'?$", s)
    tz_offset_hours: float | None = None
    tz_offset_str: str | None = None
    if tz_match:
        sign_char = tz_match.group(1)
        if sign_char == "Z":
            tz_offset_hours = 0.0
            tz_offset_str = "Z (+00:00)"
        else:
            hrs = int(tz_match.group(2)) if tz_match.group(2) else 0
            mins = int(tz_match.group(3)) if tz_match.group(3) else 0
            tz_offset_hours = hrs + mins / 60.0
            if sign_char == "-":
                tz_offset_hours = -tz_offset_hours
            tz_offset_str = f"{sign_char}{hrs:02d}:{mins:02d}"
        # Strip timezone for parsing the date part
        s = re.sub(r"[Z+\-]\d{0,2}'?\d{0,2}'?$", "", s).strip()

    s = s.ljust(14, "0")
    try:
        dt = datetime.strptime(s[:14], "%Y%m%d%H%M%S")
        result["date"] = dt.strftime("%Y-%m-%d")
        result["time"] = dt.strftime("%H:%M:%S")
        if tz_offset_hours is not None:
            tz = timezone(timedelta(hours=tz_offset_hours))
            dt_aware = dt.replace(tzinfo=tz)
            result["datetime_iso"] = dt_aware.isoformat()
        else:
            result["datetime_iso"] = dt.isoformat()
        result["tz_offset_str"] = tz_offset_str
        result["tz_offset_hours"] = tz_offset_hours
    except ValueError:
        pass

    return result


def _compute_hashes(file_bytes: bytes) -> tuple[str, str]:
    """Compute MD5 and SHA-256 hashes of the file."""
    md5 = hashlib.md5(file_bytes).hexdigest()
    sha256 = hashlib.sha256(file_bytes).hexdigest()
    return md5, sha256


def _format_file_size(size_bytes: int) -> str:
    """Convert bytes to a human-readable file size."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.2f} MB"


# ── Extended extraction with pypdf ───────────────────────────────────


def _detect_javascript(reader: PdfReader) -> bool:
    """Check if the PDF contains JavaScript."""
    try:
        if reader.trailer and "/Root" in reader.trailer:
            root = reader.trailer["/Root"]
            root_obj = root.get_object() if hasattr(root, "get_object") else root
            if "/Names" in root_obj:
                names = root_obj["/Names"]
                names_obj = names.get_object() if hasattr(names, "get_object") else names
                if "/JavaScript" in names_obj:
                    return True
        for page in reader.pages:
            page_text = str(page.get_object()) if hasattr(page, "get_object") else str(page)
            if "/JS" in page_text or "/JavaScript" in page_text:
                return True
    except Exception:
        pass
    return False


def _detect_embedded_files(reader: PdfReader) -> bool:
    """Check if the PDF has embedded file attachments."""
    try:
        if reader.trailer and "/Root" in reader.trailer:
            root = reader.trailer["/Root"]
            root_obj = root.get_object() if hasattr(root, "get_object") else root
            if "/Names" in root_obj:
                names = root_obj["/Names"]
                names_obj = names.get_object() if hasattr(names, "get_object") else names
                if "/EmbeddedFiles" in names_obj:
                    return True
    except Exception:
        pass
    return False


def _detect_acroform(reader: PdfReader) -> dict[str, Any]:
    """Check for AcroForm presence and count actual form fields."""
    result = {"has_acroform": False, "field_count": 0}
    try:
        if reader.trailer and "/Root" in reader.trailer:
            root = reader.trailer["/Root"]
            root_obj = root.get_object() if hasattr(root, "get_object") else root
            if "/AcroForm" in root_obj:
                result["has_acroform"] = True
                acro = root_obj["/AcroForm"]
                acro_obj = acro.get_object() if hasattr(acro, "get_object") else acro
                fields = acro_obj.get("/Fields", [])
                if hasattr(fields, "get_object"):
                    fields = fields.get_object()
                result["field_count"] = len(fields) if fields else 0
    except Exception:
        pass
    return result


def _get_fonts_per_page(reader: PdfReader) -> list[list[dict[str, Any]]]:
    """Extract fonts per page with embedded status."""
    pages_fonts: list[list[dict[str, Any]]] = []
    for page in reader.pages:
        page_fonts: list[dict[str, Any]] = []
        try:
            resources = page.get("/Resources")
            if resources:
                res_obj = resources.get_object() if hasattr(resources, "get_object") else resources
                font_dict = res_obj.get("/Font")
                if font_dict:
                    fd_obj = font_dict.get_object() if hasattr(font_dict, "get_object") else font_dict
                    for font_key in fd_obj:
                        font = fd_obj[font_key]
                        font_obj = font.get_object() if hasattr(font, "get_object") else font
                        base_font = font_obj.get("/BaseFont")
                        if base_font:
                            name = str(base_font).lstrip("/")
                            name = re.sub(r"^[A-Z]{6}\+", "", name)

                            # Check embedded status
                            embedded = False
                            for embed_key in ("/FontDescriptor",):
                                fd = font_obj.get(embed_key)
                                if fd:
                                    fd_resolved = fd.get_object() if hasattr(fd, "get_object") else fd
                                    for stream_key in ("/FontFile", "/FontFile2", "/FontFile3"):
                                        if stream_key in fd_resolved:
                                            embedded = True
                                            break

                            subtype = font_obj.get("/Subtype")
                            subtype_str = str(subtype).lstrip("/") if subtype else None

                            page_fonts.append({
                                "name": name,
                                "embedded": embedded,
                                "subtype": subtype_str,
                            })
        except Exception:
            pass
        pages_fonts.append(page_fonts)
    return pages_fonts


def _get_page_sizes(reader: PdfReader) -> list[dict[str, float]]:
    """Get page dimensions for all pages in points."""
    sizes: list[dict[str, float]] = []
    for page in reader.pages:
        try:
            box = page.mediabox
            sizes.append({
                "width_pt": float(box.width),
                "height_pt": float(box.height),
                "width_in": round(float(box.width) / 72, 2),
                "height_in": round(float(box.height) / 72, 2),
            })
        except Exception:
            sizes.append({"width_pt": 0, "height_pt": 0, "width_in": 0, "height_in": 0})
    return sizes


def _count_incremental_saves(file_bytes: bytes) -> int:
    """Count %%EOF markers and xref sections as a proxy for incremental saves.

    A normal PDF has exactly one %%EOF. Each incremental save appends
    another body + xref + %%EOF.
    """
    text = file_bytes.decode("latin-1", errors="replace")
    eof_count = len(re.findall(r"%%EOF", text))
    return max(eof_count - 1, 0)  # 1 is normal, extras = incremental saves


def _count_images_per_page(reader: PdfReader) -> list[int]:
    """Estimate image count per page from XObject resources."""
    counts: list[int] = []
    for page in reader.pages:
        count = 0
        try:
            resources = page.get("/Resources")
            if resources:
                res_obj = resources.get_object() if hasattr(resources, "get_object") else resources
                xobj = res_obj.get("/XObject")
                if xobj:
                    xobj_resolved = xobj.get_object() if hasattr(xobj, "get_object") else xobj
                    for key in xobj_resolved:
                        obj = xobj_resolved[key]
                        obj_resolved = obj.get_object() if hasattr(obj, "get_object") else obj
                        subtype = obj_resolved.get("/Subtype")
                        if subtype and str(subtype) == "/Image":
                            count += 1
        except Exception:
            pass
        counts.append(count)
    return counts


def _extract_text_per_page(pdf_bytes: bytes) -> list[str]:
    """Extract reading-order text per page using pdfplumber."""
    texts: list[str] = []
    try:
        with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text() or ""
                texts.append(text.strip())
    except Exception:
        pass
    return texts


# ── Main extraction function ─────────────────────────────────────────


def extract_metadata(pdf_bytes: bytes) -> dict[str, Any]:
    """Extract comprehensive PDF metadata from raw bytes.

    Wraps the existing DocForensics/app.py functions and extends them
    with per-page detail, timezone preservation, and structural counts.

    Returns a flat dict consumed by signals.py and the LLM prompt.
    """
    file_size = len(pdf_bytes)
    md5_hash, sha256_hash = _compute_hashes(pdf_bytes)

    reader = PdfReader(BytesIO(pdf_bytes))
    meta = reader.metadata or {}

    # Standard metadata fields
    producer = _safe_get(meta, "/Producer")
    creator = _safe_get(meta, "/Creator")
    author = _safe_get(meta, "/Author")
    title = _safe_get(meta, "/Title")
    subject = _safe_get(meta, "/Subject")
    keywords = _safe_get(meta, "/Keywords")
    trapped = _safe_get(meta, "/Trapped")

    # Dates with timezone preservation
    creation_date = _parse_pdf_date_raw(meta.get("/CreationDate"))
    mod_date = _parse_pdf_date_raw(meta.get("/ModDate"))

    # PDF version
    pdf_version = None
    if hasattr(reader, "pdf_header"):
        pdf_version = reader.pdf_header.replace("%PDF-", "")

    # Structural info
    num_pages = len(reader.pages)
    is_encrypted = reader.is_encrypted
    has_javascript = _detect_javascript(reader)
    has_embedded_files = _detect_embedded_files(reader)
    acroform = _detect_acroform(reader)
    fonts_per_page = _get_fonts_per_page(reader)
    page_sizes = _get_page_sizes(reader)
    images_per_page = _count_images_per_page(reader)
    incremental_saves = _count_incremental_saves(pdf_bytes)
    text_per_page = _extract_text_per_page(pdf_bytes)

    # All unique fonts across the document
    all_fonts: list[dict[str, Any]] = []
    seen: set[str] = set()
    for page_fonts in fonts_per_page:
        for f in page_fonts:
            if f["name"] not in seen:
                seen.add(f["name"])
                all_fonts.append(f)

    return {
        # File-level
        "file_size_bytes": file_size,
        "file_size_human": _format_file_size(file_size),
        "md5": md5_hash,
        "sha256": sha256_hash,

        # Standard metadata
        "producer": producer,
        "creator": creator,
        "author": author,
        "title": title,
        "subject": subject,
        "keywords": keywords,
        "trapped": trapped,

        # Dates (structured)
        "creation_date": creation_date,
        "mod_date": mod_date,

        # Structural
        "pdf_version": pdf_version,
        "page_count": num_pages,
        "is_encrypted": is_encrypted,
        "has_javascript": has_javascript,
        "has_embedded_files": has_embedded_files,
        "acroform": acroform,
        "incremental_saves": incremental_saves,

        # Per-page detail
        "page_sizes": page_sizes,
        "fonts_per_page": fonts_per_page,
        "all_fonts": all_fonts,
        "images_per_page": images_per_page,
        "text_per_page": text_per_page,
    }
