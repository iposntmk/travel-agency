import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { HeaderNavItem } from "@/types/navigation";

export function DesktopNavItem({
  item,
  isActive
}: {
  item: HeaderNavItem;
  isActive: (href: string) => boolean;
}) {
  const childItems = item.children ?? [];
  return (
    <div className="group relative">
      <HeaderLink item={item} active={isActive(item.href)} />
      {childItems.length > 0 ? (
        <div className="invisible absolute left-0 top-full z-50 mt-2 w-56 rounded-md border border-navy-100 bg-white p-2 opacity-0 shadow-elevated transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
          {childItems.map((child) => (
            <HeaderLink key={`${child.href}-${child.label}`} item={child} active={isActive(child.href)} compact />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PrimaryLink({ item }: { item: HeaderNavItem }) {
  return (
    <Link
      href={item.href}
      target={item.target}
      rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
      className="hidden rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-green-dark md:inline-flex"
    >
      {item.label}
    </Link>
  );
}

function HeaderLink({ item, active, compact = false }: { item: HeaderNavItem; active: boolean; compact?: boolean }) {
  return (
    <Link
      href={item.href}
      target={item.target}
      rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
        compact ? "block" : "inline-flex",
        active ? "bg-navy-50 text-navy-900" : "text-slate-600 hover:bg-navy-50 hover:text-navy-900"
      )}
    >
      {item.label}
    </Link>
  );
}
