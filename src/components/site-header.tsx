import { SiteHeaderClient } from "@/components/site-header-client";
import { SiteTopbar } from "@/components/site-topbar";
import { getHeaderNavigation } from "@/lib/cms-navigation";
import type { HeaderNavItem, NavItem } from "@/types/navigation";

export async function SiteHeader() {
  const items = toHeaderItems(await getHeaderNavigation());
  return (
    <SiteHeaderClient items={items}>
      <SiteTopbar />
    </SiteHeaderClient>
  );
}

function toHeaderItems(items: NavItem[]): HeaderNavItem[] {
  return items.map(toHeaderItem).filter((item): item is HeaderNavItem => Boolean(item));
}

function toHeaderItem(item: NavItem): HeaderNavItem | null {
  if (!item.href) return null;
  const children = item.children ? toHeaderItems(item.children) : undefined;
  return {
    label: item.label,
    href: item.href,
    target: item.target,
    ...(children && children.length > 0 ? { children } : {})
  };
}
