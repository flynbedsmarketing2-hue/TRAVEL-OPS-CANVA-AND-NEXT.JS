import type { ComponentType } from "react";
import {
  Briefcase,
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

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "CRM",
    href: "/crm/leads",
    icon: Users,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: ListChecks,
  },
  {
    label: "Marketing",
    href: "/marketing/campaigns",
    icon: Megaphone,
  },
  {
    label: "Packages",
    href: "/packages",
    icon: Briefcase,
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

export const isActive = (pathname: string, href: string) =>
  pathname === href || (href !== "/" && pathname.startsWith(href));

