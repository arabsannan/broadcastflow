"""
Renders `{{placeholder}}` templates against a contact's fields.

Deliberately dependency-free (no Jinja2) — the templates users write
are simple key substitutions, not full logic, so a small regex is
easier to reason about and safer than a full templating engine.
"""

import re

PLACEHOLDER_PATTERN = re.compile(r"\{\{\s*(\w+)\s*\}\}")


def render(template: str, contact_fields: dict[str, str]) -> str:
    """Replace every {{field}} in the template with the matching contact value."""
    lower_fields = {k.lower(): v for k, v in contact_fields.items()}

    def _replace(match: re.Match) -> str:
        key = match.group(1).lower()
        return str(lower_fields.get(key, match.group(0)))

    return PLACEHOLDER_PATTERN.sub(_replace, template)


def find_unknown_placeholders(template: str, known_fields: set[str]) -> list[str]:
    """
    Return any {{placeholder}} names in the template that don't match a
    known contact field (e.g. {{order_id}} when contacts only have
    name/phone) — surfaced as a warning in the preview, not an error.
    """
    known_lower = {f.lower() for f in known_fields}
    found = {m.group(1) for m in PLACEHOLDER_PATTERN.finditer(template)}
    return sorted(f for f in found if f.lower() not in known_lower)
