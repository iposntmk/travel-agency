import { Link } from "@/i18n/navigation";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
  variant?: "default" | "on-dark";
}

export function Breadcrumb({ items, variant = "default" }: Props) {
  const baseLink =
    variant === "on-dark"
      ? "text-navy-100 hover:text-white"
      : "text-slate-500 hover:text-navy-900";
  const current = variant === "on-dark" ? "text-white" : "text-navy-900";
  const sep = variant === "on-dark" ? "text-navy-100/60" : "text-slate-400";

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className={`${baseLink} transition-colors`}>
                  {item.label}
                </Link>
              ) : (
                <span className={`font-medium ${current}`} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <span aria-hidden className={sep}>
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
