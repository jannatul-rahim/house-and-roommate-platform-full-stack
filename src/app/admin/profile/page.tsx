import type { Metadata } from "next";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin profile" };

export default async function AdminProfilePage() {
  const user = await requireRole("ADMIN", "/admin/profile");
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your administrator account." />
      <ProfileSettings user={user} />
    </div>
  );
}
