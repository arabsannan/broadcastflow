"""
HTTP layer. Routes stay thin on purpose — they parse the request,
call a service, and shape the response. No business logic lives here.
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile

from app.models.schemas import (
    CampaignCreateRequest,
    CampaignStatus,
    PreviewRequest,
    PreviewResponse,
    PreviewItem,
    UploadResponse,
    WhatsAppStatus,
)
from app.services import campaign_service, csv_service, template_service, whatsapp_service

router = APIRouter(prefix="/api")


@router.post("/upload", response_model=UploadResponse)
async def upload_contacts(file: UploadFile) -> UploadResponse:
    file_bytes = await file.read()
    try:
        contacts = csv_service.parse_contacts_file(file.filename, file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    session_id = campaign_service.store_session(contacts)
    valid_count = sum(1 for c in contacts if c.valid)

    return UploadResponse(
        session_id=session_id,
        total=len(contacts),
        valid_count=valid_count,
        invalid_count=len(contacts) - valid_count,
        contacts=contacts,
    )


@router.post("/preview", response_model=PreviewResponse)
async def preview_template(payload: PreviewRequest) -> PreviewResponse:
    try:
        contacts = campaign_service.get_session_contacts(payload.session_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    valid_contacts = [c for c in contacts if c.valid][:5]  # preview first 5 only
    items = [
        PreviewItem(
            name=c.name,
            phone=c.phone,
            rendered_message=template_service.render(
                payload.template, {"name": c.name, "phone": c.phone}
            ),
        )
        for c in valid_contacts
    ]
    unknown = template_service.find_unknown_placeholders(payload.template, {"name", "phone"})

    return PreviewResponse(items=items, unknown_placeholders=unknown)


@router.post("/whatsapp/connect", response_model=WhatsAppStatus)
async def connect_whatsapp() -> WhatsAppStatus:
    """Launches the browser session. On first run, a QR code will appear."""
    session = whatsapp_service.get_session()
    session.start()
    connected = session.wait_for_login()
    return WhatsAppStatus(
        connected=connected,
        message="Connected to WhatsApp Web" if connected else "Waiting for QR code scan",
    )


@router.get("/whatsapp/status", response_model=WhatsAppStatus)
async def whatsapp_status() -> WhatsAppStatus:
    session = whatsapp_service.get_session()
    connected = session.is_connected()
    return WhatsAppStatus(
        connected=connected,
        message="Connected" if connected else "Not connected — call /api/whatsapp/connect first",
    )


@router.post("/campaigns", response_model=CampaignStatus)
async def create_campaign(payload: CampaignCreateRequest, background_tasks: BackgroundTasks) -> CampaignStatus:
    try:
        campaign = campaign_service.create_campaign(payload.session_id, payload.name)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    background_tasks.add_task(
        campaign_service.run_campaign, campaign.id, payload.session_id, payload.template
    )
    return campaign


@router.get("/campaigns", response_model=list[CampaignStatus])
async def get_campaigns() -> list[CampaignStatus]:
    return campaign_service.list_campaigns()


@router.get("/campaigns/{campaign_id}", response_model=CampaignStatus)
async def get_campaign(campaign_id: str) -> CampaignStatus:
    try:
        return campaign_service.get_campaign(campaign_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
