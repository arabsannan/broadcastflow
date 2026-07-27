"""
Small, pure validation helpers.

Nothing here talks to pandas, Selenium, or the filesystem — that keeps
these functions trivial to unit test on their own.
"""

import re
from typing import Optional

REQUIRED_COLUMNS = {"name", "number"}

# Accepts optional leading "+", then 8-15 digits. Good enough for a
# hackathon MVP; swap in a library like `phonenumbers` if you need
# strict country-code validation later.
PHONE_PATTERN = re.compile(r"^\+?\d{8,15}$")


def normalize_phone(raw: str) -> str:
    """Strip spaces/dashes/parentheses so '+1 (555) 123-4567' -> '+15551234567'."""
    return re.sub(r"[\s\-()]", "", str(raw).strip())


def validate_phone(raw: str) -> tuple[bool, Optional[str]]:
    """Return (is_valid, error_message)."""
    normalized = normalize_phone(raw)
    if not normalized:
        return False, "Missing phone number"
    if not PHONE_PATTERN.match(normalized):
        return False, "Invalid phone number format"
    return True, None


def validate_columns(columns: list[str]) -> Optional[str]:
    """Return an error message if required columns are missing, else None."""
    lower_columns = {c.strip().lower() for c in columns}
    missing = REQUIRED_COLUMNS - lower_columns
    if missing:
        return f"Missing required column(s): {', '.join(sorted(missing))}"
    return None
