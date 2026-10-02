"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogout } from "@/hooks/use-auth";

export function SignOutCard() {
  const logout = useLogout();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Session</CardTitle>
        <CardDescription>Signing out revokes this device&apos;s refresh token on the server.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" className="w-full" onClick={() => logout.mutate()} disabled={logout.isPending}>
          <LogOut /> Sign out
        </Button>
      </CardContent>
    </Card>
  );
}
