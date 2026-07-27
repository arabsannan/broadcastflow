import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/campaign", label: "New Campaign" },
  { to: "/history", label: "History" },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-[var(--color-border)] px-5 py-6 flex flex-col gap-8">
      <h1 className="font-display text-xl font-bold">
        Broadcast<span className="text-[var(--color-signal)]">Flow</span>
      </h1>
      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--color-signal-soft)] text-[var(--color-signal)]"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-surface)]"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
