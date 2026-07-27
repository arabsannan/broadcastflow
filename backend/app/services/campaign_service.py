"""
Orchestrates the CSV -> template -> send flow and tracks progress.

Storage is a plain in-memory dict, on purpose: this app has no
authentication and no persistence requirement, so a database, Redis, or
task queue would be complexity with no payoff for the timeline. If this
ever needs to survive a server restart or run for multiple users at
once, that's the natural next upgrade — noted in the README instead of
built preemptively.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from app.models.schemas import Contact, CampaignStatus
from app.services import template_service, whatsapp_service

# session_id -> list[Contact]   (uploaded, not yet sent)
_sessions: dict[str, list[Contact]] = {}

# campaign_id -> CampaignStatus  (created / running / completed campaigns)
_campaigns: dict[str, CampaignStatus] = {}


def store_session(contacts: list[Contact]) -> str:
    session_id = str(uuid.uuid4())
    _sessions[session_id] = contacts
    return session_id


def get_session_contacts(session_id: str) -> list[Contact]:
    if session_id not in _sessions:
        raise KeyError("Unknown session_id — upload contacts again.")
    return _sessions[session_id]


def create_campaign(session_id: str, name: Optional[str]) -> CampaignStatus:
    contacts = get_session_contacts(session_id)
    valid_contacts = [c for c in contacts if c.valid]

    campaign_id = str(uuid.uuid4())
    status = CampaignStatus(
        id=campaign_id,
        name=name or f"Campaign {datetime.now(timezone.utc).strftime('%b %d, %H:%M')}",
        status="pending",
        total=len(valid_contacts),
        sent=0,
        failed=0,
        current_contact=None,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    _campaigns[campaign_id] = status
    return status


def get_campaign(campaign_id: str) -> CampaignStatus:
    if campaign_id not in _campaigns:
        raise KeyError("Unknown campaign_id")
    return _campaigns[campaign_id]


def list_campaigns() -> list[CampaignStatus]:
    return sorted(_campaigns.values(), key=lambda c: c.created_at, reverse=True)


def run_campaign(campaign_id: str, session_id: str, template: str) -> None:
    """
    Runs synchronously inside a FastAPI BackgroundTask. Updates the
    shared `_campaigns[campaign_id]` object as it goes, so the frontend
    can poll GET /api/campaigns/{id} for live progress.
    """
    campaign = _campaigns[campaign_id]
    contacts = [c for c in get_session_contacts(session_id) if c.valid]
    session = whatsapp_service.get_session()

    campaign.status = "running"

    for contact in contacts:
        campaign.current_contact = contact.name
        message = template_service.render(template, {"name": contact.name, "phone": contact.phone})
        try:
            session.send_message(contact.phone, message)
            campaign.sent += 1
        except whatsapp_service.WhatsAppSendError as exc:
            campaign.failed += 1
            campaign.last_error = f"{contact.phone}: {exc}"

    campaign.status = "completed"
    campaign.current_contact = None