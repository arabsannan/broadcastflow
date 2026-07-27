// These mirror app/models/schemas.py in the backend, field for field.
// If you change one side, change the other.

export interface Contact {
  name: string;
  phone: string;
  valid: boolean;
  error: string | null;
}

export interface UploadResponse {
  session_id: string;
  total: number;
  valid_count: number;
  invalid_count: number;
  contacts: Contact[];
}

export interface PreviewItem {
  name: string;
  phone: string;
  rendered_message: string;
}

export interface PreviewResponse {
  items: PreviewItem[];
  unknown_placeholders: string[];
}

export type CampaignRunStatus = "pending" | "running" | "completed" | "failed";

export interface CampaignStatus {
  id: string;
  name: string;
  status: CampaignRunStatus;
  total: number;
  sent: number;
  failed: number;
  current_contact: string | null;
  created_at: string;
  last_error: string | null;
}

export interface WhatsAppStatus {
  connected: boolean;
  message: string;
}
