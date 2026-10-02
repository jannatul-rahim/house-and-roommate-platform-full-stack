import type { Metadata } from "next";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { ListingAvailability } from "@/components/provider/listing-availability";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Profile & availability" };

export default async function ProviderProfilePage() {
  const user = await requireRole("OWNER", "/provider/profile");
  return (
    <div className="space-y-6">
      <PageHeader title="Profile & availability" description="Your owner profile and which listings are accepting bookings." />
      <ProfileSettings user={user}>
        <ListingAvailability />
      </ProfileSettings>
    </div>
  );
}
