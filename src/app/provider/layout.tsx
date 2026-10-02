import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export default async function Layout({ children }: { children: React.ReactNode }) {
  // Second line of defence behind proxy.ts: roles come from GET /auth/me.
  const user = await requireRole("OWNER", "/provider");
  return (
    <DashboardShell user={user} role="OWNER">
      {children}
    </DashboardShell>
  );
}
