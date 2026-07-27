import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

const VARIANT_CLASSES: Record<string, string> = {
  primary:
    "bg-[var(--color-signal)] text-white hover:brightness-95 disabled:opacity-40",
  secondary:
    "bg-white text-[var(--color-ink)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] disabled:opacity-40",
  danger:
    "bg-white text-[var(--color-danger)] border border-[var(--color-danger)]/30 hover:bg-[var(--color-danger-soft)] disabled:opacity-40",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
