import type { ComponentType } from "react";
import {
  Briefcase,
  Calculator,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Plane,
  ShoppingCart,
  Telescope,
  Users,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

export const primaryNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Packages",
    href: "/packages",
    icon: Briefcase,
  },
  {
    label: "Pricing",
    href: "/pricing",
    icon: Calculator,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: ListChecks,
  },
];

export const secondaryNavItems: NavItem[] = [
  {
    label: "CRM",
    href: "/crm/leads",
    icon: Users,
  },
  {
    label: "Marketing",
    href: "/marketing/campaigns",
    icon: Megaphone,
  },
  {
    label: "Voyages",
    href: "/voyages",
    icon: Plane,
  },
  {
    label: "Sales",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    label: "Ops",
    href: "/ops",
    icon: Telescope,
  },
];

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    label: "Primary",
    items: primaryNavItems,
  },
  {
    label: "More tools",
    items: secondaryNavItems,
  },
];

export const isActive = (pathname: string, href: string) =>
  pathname === href || (href !== "/" && pathname.startsWith(href));

