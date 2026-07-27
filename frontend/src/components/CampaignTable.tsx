import type { CampaignStatus } from "../types";
import { Badge } from "./ui/Badge";

const STATUS_TONE = {
  pending: "muted",
  running: "signal",
  completed: "signal",
  failed: "danger",
} as const;

interface CampaignTableProps {
  campaigns: CampaignStatus[];
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  if (campaigns.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        No campaigns yet. Start one from "New Campaign".
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-muted)] border-b border-[var(--color-border)]">
          <th className="py-2 font-medium">Campaign</th>
          <th className="py-2 font-medium">Status</th>
          <th className="py-2 font-medium">Sent</th>
          <th className="py-2 font-medium">Failed</th>
          <th className="py-2 font-medium">Created</th>
        </tr>
      </thead>
      <tbody>
        {campaigns.map((c) => (
          <tr key={c.id} className="border-b border-[var(--color-border)] last:border-0">
            <td className="py-3 font-medium">{c.name}</td>
            <td className="py-3">
              <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
            </td>
            <td className="py-3 font-mono">{c.sent}/{c.total}</td>
            <td className="py-3 font-mono">{c.failed}</td>
            <td className="py-3 text-[var(--color-muted)]">
              {new Date(c.created_at).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
