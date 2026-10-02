import type { Metadata } from "next";
import { PropertyManager } from "@/components/provider/property-manager";

export const metadata: Metadata = { title: "Manage property" };

export default async function ManagePropertyPage({ params }: PageProps<"/provider/properties/[id]">) {
  const { id } = await params;
  return <PropertyManager propertyId={id} />;
}
