import Link from "next/link";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { PropertySummary, RoomSummary, UserSummary } from "@/types/api";

/** "Lakeview Apartment" + "Room A2 · Unit 7A · Lakeview Tower" */
export function PropertyRoomCell({ property, room, linkProperty = true }: { property?: PropertySummary | null; room?: RoomSummary | null; linkProperty?: boolean }) {
  const prop = property ?? room?.unit.building.property ?? null;
  return (
    <div className="min-w-0">
      {prop ? (
        linkProperty ? (
          <Link href={`/properties/${prop.id}`} className="line-clamp-1 font-medium hover:text-primary hover:underline">
            {prop.title}
          </Link>
        ) : (
          <p className="line-clamp-1 font-medium">{prop.title}</p>
        )
      ) : (
        <p className="font-medium">—</p>
      )}
      {room && (
        <p className="line-clamp-1 text-xs text-muted-foreground">
          Room {room.roomNumber}
          {room.name ? ` (${room.name})` : ""} · Unit {room.unit.unitNumber} · {room.unit.building.name}
        </p>
      )}
    </div>
  );
}

export function PersonCell({ user, subtitle }: { user: UserSummary; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <UserAvatar name={user.name} image={user.image} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{user.name}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
