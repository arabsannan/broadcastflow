import pytest

from app.utils.validators import normalize_phone, validate_columns, validate_phone


@pytest.mark.parametrize(
    "phone",
    [
        "+1 415 555 2671",
        "+1-415-555-2671",
        "+1 (415) 555-2671",
        " +14155552671 ",
    ],
)
def test_validate_phone_accepts_common_formatting(phone):
    assert validate_phone(phone) == (True, None)

@pytest.mark.parametrize(
    "phone",
    [
        "",
        " ",
        "nan",
        "N/A",
    ],
)
def test_validate_phone_rejects_empty_or_non_phone_values(phone):
    assert validate_phone(phone) == (False, "Missing phone number",)

def test_normalize_phone_strips_formatting():
    assert normalize_phone("+1 (415) 555-2671") == "+14155552671"

def test_validate_phone_accepts_valid_numbers():
    assert validate_phone("+14155552671") == (True, None)
    assert validate_phone("+233241234567") == (True, None)
    assert validate_phone("+442083661177") == (True, None)


def test_validate_phone_rejects_invalid_numbers():
    assert validate_phone("555-123-45678") == (False,"Country code required",)
    assert validate_phone("+2234954") == (False,"Invalid phone number",)
    assert validate_phone("") == (False,"Missing phone number",)


def test_validate_columns_accepts_required_columns():
    assert validate_columns(["name", "number"]) is None
    assert validate_columns(["Name", "Number"]) is None
    assert validate_columns(["name ", " number"]) is None

