import { CalendarDays, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABEL } from "@/lib/auth/constants";
import { formatDate } from "@/lib/format";
import type { AuthUser } from "@/types/api";
import { AppearanceSettings } from "./appearance-settings";
import { AvatarUploader } from "./avatar-uploader";
import { SignOutCard } from "./sign-out-card";

/** Profile & settings shared by every role. */
export function ProfileSettings({ user, children }: { user: AuthUser; children?: React.ReactNode }) {
  const details = [
    { icon: UserRound, label: "Full name", value: user.name },
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Phone", value: user.phone ?? "Not provided" },
    { icon: ShieldCheck, label: "Role", value: user.roles.map((r) => ROLE_LABEL[r]).join(", ") },
    { icon: CalendarDays, label: "Member since", value: formatDate(user.createdAt) },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Profile</CardTitle>
            <CardDescription>Your photo and account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AvatarUploader user={user} />
            <dl className="grid gap-4 border-t pt-6 xl:grid-cols-2">
              {details.map((d) => (
                <div key={d.label} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <d.icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{d.label}</dt>
                    <dd className="truncate font-medium">{d.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        {children}
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Appearance</CardTitle>
            <CardDescription>Choose how NestMate looks on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <AppearanceSettings />
          </CardContent>
        </Card>
        <SignOutCard />
      </div>
    </div>
  );
}
