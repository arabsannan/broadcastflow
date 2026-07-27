"""
Reads an uploaded contacts file (CSV or Excel) into validated Contact
objects. This is the only module that knows about pandas.
"""

import io
import pandas as pd

from app.models.schemas import Contact
from app.utils.validators import normalize_phone, validate_phone, validate_columns


def parse_contacts_file(filename: str, file_bytes: bytes) -> list[Contact]:
    """
    Parse an uploaded .csv/.xlsx file into a list of Contact objects,
    each already validated (valid=True/False + error message).

    Raises ValueError for structural problems (wrong columns, unreadable
    file) so the route layer can turn that into a clean 400 response.
    """
    df = _read_dataframe(filename, file_bytes)

    error = validate_columns(list(df.columns))
    if error:
        raise ValueError(error)

    # Normalize column lookup (case-insensitive) without mutating the
    # original column names used elsewhere.
    column_map = {c.strip().lower(): c for c in df.columns}
    name_col = column_map["name"]
    number_col = column_map["number"]

    contacts: list[Contact] = []
    seen_numbers: set[str] = set()

    for _, row in df.iterrows():
        raw_name = str(row.get(name_col, "")).strip()
        raw_number = row.get(number_col, "")

        is_valid, err = validate_phone(raw_number)
        normalized = normalize_phone(raw_number)

        if is_valid and normalized in seen_numbers:
            is_valid, err = False, "Duplicate phone number"
        elif is_valid:
            seen_numbers.add(normalized)

        if is_valid and not raw_name:
            is_valid, err = False, "Missing name"

        contacts.append(
            Contact(
                name=raw_name or "(unknown)",
                phone=normalized,
                valid=is_valid,
                error=err,
            )
        )

    return contacts


def _read_dataframe(filename: str, file_bytes: bytes) -> pd.DataFrame:
    lower = filename.lower()
    buffer = io.BytesIO(file_bytes)

    try:
        if lower.endswith(".csv"):
            return pd.read_csv(buffer)
        if lower.endswith((".xlsx", ".xls")):
            return pd.read_excel(buffer)
    except Exception as exc:  # noqa: BLE001 - surfaced as a clean 400 upstream
        raise ValueError(f"Could not read file: {exc}") from exc

    raise ValueError("Unsupported file type. Please upload a .csv or .xlsx file.")
