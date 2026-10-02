import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/auth/constants";
import type { AuthUser, Role } from "@/types/api";
import { AuthHydrator } from "./auth-hydrator";
import { DashboardMobileNav } from "./dashboard-mobile-nav";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

const ROLE_TAGLINE: Record<Role, string> = {
  ADMIN: "Platform control centre",
  OWNER: "Provider workspace",
  TENANT: "Tenant workspace",
};

/** Shared chrome for all three role dashboards. */
export function DashboardShell({ user, role, children }: { user: AuthUser; role: Role; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <AuthHydrator user={user} />
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Logo href={ROLE_HOME[role]} />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <SidebarNav role={role} />
        </div>
        <div className="flex items-center gap-3 border-t p-4">
          <UserAvatar name={user.name} image={user.image} className="size-9" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{ROLE_LABEL[role]}</p>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-lg sm:px-6">
          <div className="flex items-center gap-2">
            <DashboardMobileNav role={role} />
            <div className="lg:hidden">
              <Logo href={ROLE_HOME[role]} />
            </div>
            <p className="hidden text-sm font-medium text-muted-foreground lg:block">{ROLE_TAGLINE[role]}</p>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
