"""HRDocForensics — Formatting utilities."""

from __future__ import annotations

import re


def format_inr(amount: float | int | None) -> str:
    """Format a number with Indian digit grouping (e.g. 13,00,000).

    Indian grouping: last 3 digits, then groups of 2.
    """
    if amount is None:
        return "N/A"

    amount = round(amount)
    negative = amount < 0
    amount = abs(amount)

    s = str(amount)
    if len(s) <= 3:
        result = s
    else:
        last_three = s[-3:]
        rest = s[:-3]
        # Group the rest in pairs from the right
        groups = []
        while rest:
            groups.append(rest[-2:])
            rest = rest[:-2]
        groups.reverse()
        result = ",".join(groups) + "," + last_three

    prefix = "₹" if not negative else "-₹"
    return f"{prefix}{result}"


def format_pct(value: float | None, decimals: int = 1) -> str:
    """Format a percentage value."""
    if value is None:
        return "N/A"
    return f"{value:+.{decimals}f}%"


def format_delta_inr(amount: float | int | None) -> str:
    """Format an INR delta with +/- sign."""
    if amount is None:
        return "N/A"
    sign = "+" if amount >= 0 else ""
    return f"{sign}{format_inr(amount)}"
