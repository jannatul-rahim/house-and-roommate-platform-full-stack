import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileSignature,
  FileText,
  Heart,
  Home,
  LayoutDashboard,
  ListChecks,
  ReceiptText,
  ScrollText,
  Settings2,
  SlidersHorizontal,
  UserRound,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { Role } from "@/types/api";

export const publicNav = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Find a room" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Sidebar navigation per role - the UI only ever shows a role its own areas. */
export const dashboardNav: Record<Role, NavSection[]> = {
  TENANT: [
    {
      title: "Overview",
      items: [
        { href: "/dashboard", label: "My activity", icon: LayoutDashboard },
        { href: "/properties", label: "Browse rooms", icon: Home },
      ],
    },
    {
      title: "Renting",
      items: [
        { href: "/dashboard/viewings", label: "Viewing requests", icon: CalendarCheck },
        { href: "/dashboard/applications", label: "Applications", icon: FileText },
        { href: "/dashboard/leases", label: "My leases", icon: FileSignature },
        { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
        { href: "/dashboard/bills", label: "Utility bills", icon: ReceiptText },
        { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
      ],
    },
    {
      title: "Roommates",
      items: [
        { href: "/dashboard/roommates", label: "Find roommates", icon: Heart },
        { href: "/dashboard/roommate-profile", label: "Roommate profile", icon: SlidersHorizontal },
      ],
    },
    { title: "Account", items: [{ href: "/dashboard/profile", label: "Profile & settings", icon: UserRound }] },
  ],
  OWNER: [
    {
      title: "Overview",
      items: [
        { href: "/provider", label: "Dashboard", icon: LayoutDashboard },
        { href: "/provider/earnings", label: "Earnings", icon: Wallet },
      ],
    },
    {
      title: "Listings",
      items: [
        { href: "/provider/properties", label: "My properties", icon: Building2 },
        { href: "/provider/requests", label: "Requests", icon: ListChecks },
        { href: "/provider/leases", label: "Leases", icon: FileSignature },
      ],
    },
    {
      title: "Operations",
      items: [
        { href: "/provider/maintenance", label: "Maintenance", icon: Wrench },
        { href: "/provider/bills", label: "Utility bills", icon: ReceiptText },
      ],
    },
    { title: "Account", items: [{ href: "/provider/profile", label: "Profile & availability", icon: UserRound }] },
  ],
  ADMIN: [
    {
      title: "Overview",
      items: [{ href: "/admin", label: "Analytics", icon: BarChart3 }],
    },
    {
      title: "Manage",
      items: [
        { href: "/admin/properties", label: "Properties", icon: Building2 },
        { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
        { href: "/admin/payments", label: "Payments", icon: CreditCard },
        { href: "/admin/maintenance", label: "Maintenance", icon: Wrench },
        { href: "/admin/preferences", label: "Roommate preferences", icon: Settings2 },
      ],
    },
    {
      title: "Reports",
      items: [
        { href: "/admin/reports", label: "Audit logs", icon: ScrollText },
        { href: "/admin/tenants", label: "Tenants", icon: Users },
        { href: "/admin/profile", label: "Profile", icon: UserRound },
      ],
    },
  ],
};
