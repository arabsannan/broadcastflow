"""
Small, pure validation helpers.

Nothing here talks to pandas, Selenium, or the filesystem — that keeps
these functions trivial to unit test on their own.
"""

import re
from typing import Optional
import phonenumbers
from phonenumbers import PhoneNumberFormat

REQUIRED_COLUMNS = {"name", "number"}


def normalize_phone(raw: str) -> str:
    """Strip spaces/dashes/parentheses so '+1 (555) 123-4567' -> '+15551234567'."""
    text = str(raw).strip().lower()
    if text in {"", "nan", "n/a", "none"}:
        return ""
    return re.sub(r"[\s\-()]", "", str(raw).strip())

def validate_phone(raw: str ) -> tuple[bool, str | None]:
    normalized = normalize_phone(raw)

    if not normalized:
        return False, "Missing phone number"

    if not normalized.startswith("+"):
        return False, "Country code required"

    try:
        number = phonenumbers.parse(normalized, None)
    except phonenumbers.NumberParseException:
        return False, "Invalid phone number format"

    if not phonenumbers.is_valid_number(number):
        return False, "Invalid phone number"

    return True, None


def validate_columns(columns: list[str]) -> Optional[str]:
    """Return an error message if required columns are missing, else None."""
    lower_columns = {c.strip().lower() for c in columns}
    missing = REQUIRED_COLUMNS - lower_columns
    if missing:
        return f"Missing required column(s): {', '.join(sorted(missing))}"
    return None
