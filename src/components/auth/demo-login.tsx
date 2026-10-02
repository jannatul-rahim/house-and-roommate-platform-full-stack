"use client";

import { Building2, Loader2, Rocket, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoLogin } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/api";

const DEMO_ROLES: { role: Role; title: string; description: string; icon: LucideIcon; tone: string }[] = [
  { role: "ADMIN", title: "Admin", description: "Analytics, moderation & audit logs", icon: ShieldCheck, tone: "bg-violet-500/10 text-violet-600 dark:text-violet-300" },
  { role: "TENANT", title: "User (Tenant)", description: "Book viewings, apply & pay rent", icon: UserRound, tone: "bg-sky-500/10 text-sky-600 dark:text-sky-300" },
  { role: "OWNER", title: "Provider (Owner)", description: "List rooms & manage requests", icon: Building2, tone: "bg-amber-500/10 text-amber-600 dark:text-amber-300" },
];

/** One-click demo sign-in for each of the three roles. */
export function DemoLogin() {
  const demo = useDemoLogin();

  return (
    <section aria-labelledby="demo-heading" className="space-y-4">
      <h2 id="demo-heading" className="flex items-center justify-center gap-2 text-sm font-semibold">
        <Rocket className="size-4 text-primary" aria-hidden /> Quick demo login
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {DEMO_ROLES.map(({ role, title, description, icon: Icon, tone }, index) => {
          const pending = demo.isPending && demo.variables === role;
          return (
            <div
              key={role}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center shadow-xs",
                // Third card sits centred on its own row, as in the spec layout.
                index === 2 && "col-span-2 mx-auto w-full max-w-[calc(50%-0.375rem)]",
              )}
            >
              <span className={cn("flex size-10 items-center justify-center rounded-xl", tone)}>
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-1 w-full"
                disabled={demo.isPending}
                onClick={() => demo.mutate(role)}
                aria-label={`Demo login as ${title}`}
              >
                {pending && <Loader2 className="animate-spin" />}
                Demo Login
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
