import { useQuery } from "@tanstack/react-query";
import { listCampaigns } from "../services/api";
import { Card } from "../components/ui/Card";
import { CampaignTable } from "../components/CampaignTable";

export function History() {
  const campaigns = useQuery({
    queryKey: ["campaigns"],
    queryFn: listCampaigns,
    refetchInterval: 5000,
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold">History</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Every campaign you've sent, in one place.
        </p>
      </div>

      <Card>
        <CampaignTable campaigns={campaigns.data ?? []} />
      </Card>
    </div>
  );
}
