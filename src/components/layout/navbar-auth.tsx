"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-auth";
import { UserMenu } from "./user-menu";

/** Right side of the public navbar: sign-in buttons or the account menu. */
export function NavbarAuth() {
  const { user, isLoading } = useSession();

  if (isLoading) return <Skeleton className="h-9 w-24 rounded-full" />;
  if (user) return <UserMenu user={user} />;

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Button variant="ghost" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
      <Button asChild>
        <Link href="/register">Get started</Link>
      </Button>
    </div>
  );
}
