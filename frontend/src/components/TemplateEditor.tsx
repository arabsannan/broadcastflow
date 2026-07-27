import { useMemo } from "react";
import { Card } from "./ui/Card";

const PLACEHOLDER_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;
const KNOWN_FIELDS = new Set(["name", "phone"]);

interface TemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TemplateEditor({ value, onChange }: TemplateEditorProps) {
  const placeholders = useMemo(() => {
    const found = new Set<string>();
    let match: RegExpExecArray | null;
    const pattern = new RegExp(PLACEHOLDER_PATTERN);
    while ((match = pattern.exec(value)) !== null) {
      found.add(match[1].toLowerCase());
    }
    return Array.from(found);
  }, [value]);

  return (
    <Card eyebrow="Step 2" title="Message template">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"Hi {{name}}, ..."}
        rows={4}
        className="w-full font-mono text-sm border border-[var(--color-border)] rounded-lg p-3 resize-none focus:border-[var(--color-signal)]"
      />

      {placeholders.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {placeholders.map((field) => (
            <span
              key={field}
              className={
                KNOWN_FIELDS.has(field)
                  ? "merge-token"
                  : "font-mono text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-700"
              }
            >
              {"{{" + field + "}}"}
              {!KNOWN_FIELDS.has(field) && " — not in your contacts"}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--color-muted)] mt-3">
        Available fields: <span className="merge-token">{"{{name}}"}</span>{" "}
        <span className="merge-token">{"{{phone}}"}</span>
      </p>
    </Card>
  );
}
