import type { ReactNode } from "react";

interface BadgeProps {
  tone?: "signal" | "danger" | "muted";
  children: ReactNode;
}

const TONE_CLASSES: Record<string, string> = {
  signal: "bg-[var(--color-signal-soft)] text-[var(--color-signal)]",
  danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  muted: "bg-[var(--color-surface)] text-[var(--color-muted)]",
};

export function Badge({ tone = "muted", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
