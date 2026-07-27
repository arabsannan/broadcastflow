import axios from "axios";
import type {
  CampaignStatus,
  PreviewResponse,
  UploadResponse,
  WhatsAppStatus,
} from "../types";

const client = axios.create({ baseURL: "/api" });

export async function uploadContacts(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post<UploadResponse>("/upload", formData);
  return data;
}

export async function previewTemplate(
  sessionId: string,
  template: string
): Promise<PreviewResponse> {
  const { data } = await client.post<PreviewResponse>("/preview", {
    session_id: sessionId,
    template,
  });
  return data;
}

export async function connectWhatsApp(): Promise<WhatsAppStatus> {
  const { data } = await client.post<WhatsAppStatus>("/whatsapp/connect");
  return data;
}

export async function getWhatsAppStatus(): Promise<WhatsAppStatus> {
  const { data } = await client.get<WhatsAppStatus>("/whatsapp/status");
  return data;
}

export async function createCampaign(
  sessionId: string,
  template: string,
  name?: string
): Promise<CampaignStatus> {
  const { data } = await client.post<CampaignStatus>("/campaigns", {
    session_id: sessionId,
    template,
    name,
  });
  return data;
}

export async function listCampaigns(): Promise<CampaignStatus[]> {
  const { data } = await client.get<CampaignStatus[]>("/campaigns");
  return data;
}

export async function getCampaign(id: string): Promise<CampaignStatus> {
  const { data } = await client.get<CampaignStatus>(`/campaigns/${id}`);
  return data;
}
