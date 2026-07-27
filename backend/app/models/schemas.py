"""
Request/response shapes for the API.

Keeping these separate from the service logic means the frontend
contract (what JSON looks like) can be reviewed in one place, without
wading through business logic.
"""

from typing import Optional
from pydantic import BaseModel


class Contact(BaseModel):
    name: str
    phone: str
    valid: bool
    error: Optional[str] = None


class UploadResponse(BaseModel):
    session_id: str
    total: int
    valid_count: int
    invalid_count: int
    contacts: list[Contact]


class PreviewRequest(BaseModel):
    session_id: str
    template: str


class PreviewItem(BaseModel):
    name: str
    phone: str
    rendered_message: str


class PreviewResponse(BaseModel):
    items: list[PreviewItem]
    unknown_placeholders: list[str]


class CampaignCreateRequest(BaseModel):
    session_id: str
    template: str
    name: Optional[str] = None


class CampaignStatus(BaseModel):
    id: str
    name: str
    status: str  # "pending" | "running" | "completed" | "failed"
    total: int
    sent: int
    failed: int
    current_contact: Optional[str] = None
    created_at: str
    last_error: Optional[str] = None


class WhatsAppStatus(BaseModel):
    connected: bool
    message: str