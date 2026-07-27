import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createCampaign } from "../services/api";
import type { UploadResponse } from "../types";
import { UploadCard } from "../components/UploadCard";
import { TemplateEditor } from "../components/TemplateEditor";
import { PreviewCard } from "../components/PreviewCard";
import { ProgressCard } from "../components/ProgressCard";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export function Campaign() {
  const [upload, setUpload] = useState<UploadResponse | null>(null);
  const [template, setTemplate] = useState("Hi {{name}}, ");
  const [campaignId, setCampaignId] = useState<string | null>(null);

  const send = useMutation({
    mutationFn: () => createCampaign(upload!.session_id, template),
    onSuccess: (campaign) => setCampaignId(campaign.id),
  });

  const canSend = Boolean(upload) && upload!.valid_count > 0 && template.trim().length > 0;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold">New campaign</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Upload contacts, write one template, send to everyone.
        </p>
      </div>

      <UploadCard onUploaded={(result) => { setUpload(result); setCampaignId(null); }} />
      <TemplateEditor value={template} onChange={setTemplate} />
      <PreviewCard sessionId={upload?.session_id ?? null} template={template} />

      {upload && (
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--color-muted)]">
              Ready to send to <span className="font-mono">{upload.valid_count}</span> recipients.
            </p>
            <Button onClick={() => send.mutate()} disabled={!canSend || send.isPending}>
              {send.isPending ? "Starting…" : "Send campaign"}
            </Button>
          </div>
        </Card>
      )}

      {campaignId && <ProgressCard campaignId={campaignId} />}
    </div>
  );
}
