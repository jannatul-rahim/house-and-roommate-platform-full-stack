import type { Metadata } from "next";
import { RoommateProfileWizard } from "@/components/roommates/roommate-profile-wizard";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Roommate profile" };

export default function RoommateProfilePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Roommate profile" description="Five quick steps — the more you share, the better your matches." />
      <RoommateProfileWizard />
    </div>
  );
}
