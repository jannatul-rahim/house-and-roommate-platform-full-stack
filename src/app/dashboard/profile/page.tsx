import type { Metadata } from "next";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Profile & settings" };

export default async function TenantProfilePage() {
  const user = await requireRole("TENANT", "/dashboard/profile");
  return (
    <div className="space-y-6">
      <PageHeader title="Profile & settings" description="Manage your photo, appearance and session." />
      <ProfileSettings user={user} />
    </div>
  );
}
