export type NavTarget = "_self" | "_blank";

export interface NavItem {
  label: string;
  href?: string;
  target?: NavTarget;
  children?: NavItem[];
}

export type HeaderNavItem = Omit<NavItem, "href" | "children"> & {
  href: string;
  children?: HeaderNavItem[];
};
