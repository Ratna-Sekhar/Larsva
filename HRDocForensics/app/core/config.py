"""HRDocForensics — Configuration via environment variables."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Literal

import yaml
from pydantic_settings import BaseSettings
from pydantic import Field


_ROOT = Path(__file__).resolve().parent.parent.parent  # HRDocForensics/


class Settings(BaseSettings):
    """All configuration knobs, loaded from .env or environment."""

    # ── LLM ──
    openai_api_key: str = ""
    llm_model: str = "gpt-5.6-terra"
    llm_fallback_model: str = ""
    reasoning_effort: Literal["low", "medium", "high"] = "medium"
    max_output_tokens: int = 16_000

    # ── Image detail ──
    image_detail_flagged: Literal["low", "auto", "high"] = "high"
    image_detail_default: Literal["low", "auto", "high"] = "auto"

    # ── PDF limits ──
    max_pages: int = 20
    max_upload_mb: int = 10
    render_dpi: int = 150
    max_image_edge_px: int = 1568

    # ── Rate limiting & cost ──
    daily_spend_cap_usd: float = 50.0
    rate_limit_per_ip_per_hour: int = 20

    # ── Privacy ──
    retain_results: bool = False
    allowed_origins: str = "https://larsva.com"

    model_config = {"env_file": str(_ROOT / ".env"), "extra": "ignore"}


def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()


def load_producers_yaml() -> dict[str, list[str]]:
    """Load config/producers.yaml → {class_name: [substrings]}."""
    path = _ROOT / "config" / "producers.yaml"
    with open(path, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)
    return {
        k: [s.lower() for s in v]
        for k, v in raw.items()
        if isinstance(v, list)
    }


def load_retention_factors_yaml() -> dict:
    """Load config/retention_factors.yaml."""
    path = _ROOT / "config" / "retention_factors.yaml"
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_recommendations_json() -> dict:
    """Load config/recommendations.json."""
    path = _ROOT / "config" / "recommendations.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_system_prompt() -> str:
    """Load prompts/forensic_system_prompt.md."""
    path = _ROOT / "prompts" / "forensic_system_prompt.md"
    return path.read_text(encoding="utf-8")
