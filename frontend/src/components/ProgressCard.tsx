import { useQuery } from "@tanstack/react-query";
import { getCampaign } from "../services/api";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";

interface ProgressCardProps {
  campaignId: string;
}

const STATUS_TONE = {
  pending: "muted",
  running: "signal",
  completed: "signal",
  failed: "danger",
} as const;

export function ProgressCard({ campaignId }: ProgressCardProps) {
  const { data } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => getCampaign(campaignId),
    refetchInterval: (query) =>
      query.state.data?.status === "running" || query.state.data?.status === "pending"
        ? 1500
        : false,
  });

  if (!data) return null;

  const percent = data.total === 0 ? 0 : Math.round(((data.sent + data.failed) / data.total) * 100);

  return (
    <Card eyebrow="Step 4" title="Send progress">
      <div className="flex items-center justify-between mb-3">
        <Badge tone={STATUS_TONE[data.status]}>{data.status}</Badge>
        <span className="font-mono text-xs text-[var(--color-muted)]">{percent}%</span>
      </div>

      <div className="w-full h-2 rounded-full bg-[var(--color-surface)] overflow-hidden">
        <div
          className="h-full bg-[var(--color-signal)] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex gap-4 mt-3 text-sm text-[var(--color-muted)]">
        <span>{data.sent} sent</span>
        {data.failed > 0 && <span className="text-[var(--color-danger)]">{data.failed} failed</span>}
        <span>{data.total} total</span>
      </div>

      {data.current_contact && data.status === "running" && (
        <p className="text-xs text-[var(--color-muted)] mt-2">
          Sending to <span className="font-mono">{data.current_contact}</span>…
        </p>
      )}

      {data.last_error && (
        <p className="text-xs text-[var(--color-danger)] mt-2">
          Last failure: <span className="font-mono">{data.last_error}</span>
        </p>
      )}
    </Card>
  );
}