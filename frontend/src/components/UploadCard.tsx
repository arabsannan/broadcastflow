import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadContacts } from "../services/api";
import type { UploadResponse } from "../types";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";

interface UploadCardProps {
  onUploaded: (result: UploadResponse) => void;
}

export function UploadCard({ onUploaded }: UploadCardProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: uploadContacts,
    onSuccess: onUploaded,
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    mutation.mutate(file);
  }

  return (
    <Card eyebrow="Step 1" title="Upload contacts">
      <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-[var(--color-border)] rounded-lg py-8 cursor-pointer hover:bg-[var(--color-surface)] transition-colors">
        <span className="text-sm text-[var(--color-muted)]">
          {fileName ?? "Drop a .csv or .xlsx file, or click to browse"}
        </span>
        <span className="font-mono text-xs text-[var(--color-muted)]">
          requires "Name" and "Number" columns
        </span>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {mutation.isPending && (
        <p className="text-sm text-[var(--color-muted)] mt-4">Reading file…</p>
      )}

      {mutation.isError && (
        <p className="text-sm text-[var(--color-danger)] mt-4">
          {(mutation.error as Error)?.message ?? "Could not read that file."}
        </p>
      )}

      {mutation.data && (
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <Badge tone="signal">✓ {mutation.data.valid_count} valid</Badge>
            {mutation.data.invalid_count > 0 && (
              <Badge tone="danger">⚠ {mutation.data.invalid_count} invalid</Badge>
            )}
          </div>
          {mutation.data.invalid_count > 0 && (
            <ul className="text-xs text-[var(--color-muted)] mt-1 space-y-0.5">
              {mutation.data.contacts
                .filter((c) => !c.valid)
                .slice(0, 5)
                .map((c, i) => (
                  <li key={i}>
                    <span className="font-mono">{c.name}</span> — {c.error}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
