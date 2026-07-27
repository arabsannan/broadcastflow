import { useMutation, useQuery } from "@tanstack/react-query";
import { connectWhatsApp, getWhatsAppStatus, listCampaigns } from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { CampaignTable } from "../components/CampaignTable";

export function Dashboard() {
  const status = useQuery({
    queryKey: ["whatsapp-status"],
    queryFn: getWhatsAppStatus,
    refetchInterval: 5000,
  });

  const connect = useMutation({
    mutationFn: connectWhatsApp,
    onSuccess: () => status.refetch(),
  });

  const campaigns = useQuery({ queryKey: ["campaigns"], queryFn: listCampaigns });

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Personalized WhatsApp campaigns, sent from a spreadsheet.
        </p>
      </div>

      <Card eyebrow="Connection" title="WhatsApp Web">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge tone={status.data?.connected ? "signal" : "muted"}>
              {status.data?.connected ? "Connected" : "Not connected"}
            </Badge>
            <span className="text-sm text-[var(--color-muted)]">
              {status.data?.message}
            </span>
          </div>
          {!status.data?.connected && (
            <Button onClick={() => connect.mutate()} disabled={connect.isPending}>
              {connect.isPending ? "Opening browser…" : "Connect"}
            </Button>
          )}
        </div>
        {connect.isPending && (
          <p className="text-xs text-[var(--color-muted)] mt-3">
            A browser window will open. Scan the QR code with WhatsApp on your phone
            (only needed once).
          </p>
        )}
      </Card>

      <Card eyebrow="Recent" title="Latest campaigns">
        <CampaignTable campaigns={(campaigns.data ?? []).slice(0, 5)} />
      </Card>
    </div>
  );
}
