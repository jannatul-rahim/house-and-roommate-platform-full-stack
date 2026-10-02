import type { Metadata } from "next";
import { PropertyWizard } from "@/components/provider/property-wizard";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Add property" };

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Add a property" description="Five steps: details, location, building & unit, first room, then review and publish." />
      <PropertyWizard />
    </div>
  );
}
