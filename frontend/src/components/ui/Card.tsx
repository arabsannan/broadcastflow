import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, eyebrow, children, className = "" }: CardProps) {
  return (
    <section
      className={`bg-white border border-[var(--color-border)] rounded-xl p-6 ${className}`}
    >
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1">
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="font-display text-lg font-semibold mb-4">{title}</h2>
      )}
      {children}
    </section>
  );
}
