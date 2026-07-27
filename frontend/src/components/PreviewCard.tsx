import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { previewTemplate } from "../services/api";
import type { PreviewItem } from "../types";
import { Card } from "./ui/Card";

interface PreviewCardProps {
  sessionId: string | null;
  template: string;
}

/** Wraps occurrences of the contact's own values in the rendered message
 * with the emerald "resolved merge field" underline, so you can see at a
 * glance which part of the message came from the template being filled in. */
function highlightResolvedValues(message: string, values: string[]) {
  let result: (string | { resolved: string })[] = [message];

  for (const value of values) {
    if (!value) continue;
    result = result.flatMap((part) => {
      if (typeof part !== "string") return [part];
      return part.split(value).flatMap((chunk, i, arr) =>
        i < arr.length - 1 ? [chunk, { resolved: value }] : [chunk]
      );
    });
  }
  return result;
}

function RenderedMessage({ item }: { item: PreviewItem }) {
  const parts = highlightResolvedValues(item.rendered_message, [item.name, item.phone]);
  return (
    <p className="text-sm">
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <span key={i} className="merge-resolved font-medium">
            {part.resolved}
          </span>
        )
      )}
    </p>
  );
}

export function PreviewCard({ sessionId, template }: PreviewCardProps) {
  const mutation = useMutation({ mutationFn: () => previewTemplate(sessionId!, template) });

  useEffect(() => {
    if (sessionId && template.trim()) {
      const timeout = setTimeout(() => mutation.mutate(), 300); // debounce typing
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, template]);

  if (!sessionId) return null;

  return (
    <Card eyebrow="Step 3" title="Preview">
      {!template.trim() && (
        <p className="text-sm text-[var(--color-muted)]">
          Start typing a template above to see it rendered here.
        </p>
      )}
      {mutation.data && (
        <div className="flex flex-col gap-3">
          {mutation.data.items.map((item) => (
            <div key={item.phone} className="border-b border-[var(--color-border)] last:border-0 pb-3 last:pb-0">
              <p className="font-mono text-xs text-[var(--color-muted)] mb-1">
                {item.name} · {item.phone}
              </p>
              <RenderedMessage item={item} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
