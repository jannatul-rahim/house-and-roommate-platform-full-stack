import { SearchX } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function PropertyNotFound() {
  return (
    <div className="container-page py-20">
      <EmptyState
        icon={SearchX}
        title="This listing isn't available"
        description="It may have been unpublished by the owner or the link is incorrect."
        action={
          <Button asChild>
            <Link href="/properties">Browse other homes</Link>
          </Button>
        }
      />
    </div>
  );
}
