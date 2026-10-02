import { Briefcase, CalendarDays, Cigarette, MapPin, PawPrint, Wallet } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RoommateMatch, RoommateProfile } from "@/types/api";

const BREAKDOWN: { key: keyof RoommateMatch["breakdown"]; label: string; max: number }[] = [
  { key: "budget", label: "Budget", max: 30 },
  { key: "lifestyle", label: "Lifestyle", max: 20 },
  { key: "location", label: "Location", max: 20 },
  { key: "moveIn", label: "Move-in", max: 15 },
  { key: "preferences", label: "Preferences", max: 15 },
];

function ScoreRing({ score }: { score: number }) {
  const tone = score >= 75 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-500";
  return (
    <div className="relative size-16 shrink-0" role="img" aria-label={`${score}% compatible`}>
      <svg viewBox="0 0 36 36" className="size-16 -rotate-90">
        <circle cx="18" cy="18" r="15.5" className="fill-none stroke-muted" strokeWidth="3.5" />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          className={cn("fill-none stroke-current", tone)}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 97.4} 97.4`}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-base font-bold leading-none">{score}%</span>
        <span className="text-[9px] text-muted-foreground">match</span>
      </span>
    </div>
  );
}

export function RoommateCard({ profile, match }: { profile: RoommateProfile; match?: RoommateMatch }) {
  const budget =
    profile.budgetMin !== null || profile.budgetMax !== null
      ? `${formatCurrency(profile.budgetMin)} – ${formatCurrency(profile.budgetMax)}`
      : "Flexible budget";

  return (
    <article className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-md">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar name={profile.user.name} image={profile.user.image} className="size-12" />
          <div>
            <h3 className="font-heading font-semibold">{profile.user.name}</h3>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Briefcase className="size-3.5" aria-hidden /> {profile.occupation ?? "—"}
            </p>
          </div>
        </div>
        {match && <ScoreRing score={match.compatibilityScore} />}
      </header>

      {profile.bio && <p className="line-clamp-3 text-sm text-muted-foreground">{profile.bio}</p>}

      <ul className="grid grid-cols-2 gap-2 text-xs">
        <li className="flex items-center gap-1.5">
          <Wallet className="size-3.5 text-primary" aria-hidden /> {budget}
        </li>
        <li className="flex items-center gap-1.5">
          <MapPin className="size-3.5 text-primary" aria-hidden /> {profile.preferredLocation ?? "Anywhere"}
        </li>
        <li className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5 text-primary" aria-hidden /> {profile.moveInDate ? formatDate(profile.moveInDate) : "Flexible"}
        </li>
        <li className="flex items-center gap-3">
          <span className={cn("flex items-center gap-1", profile.smoking ? "text-amber-600" : "text-muted-foreground")}>
            <Cigarette className="size-3.5" aria-hidden /> {profile.smoking ? "Smoker" : "Non-smoker"}
          </span>
          <span className={cn("flex items-center gap-1", profile.pets ? "text-primary" : "text-muted-foreground")}>
            <PawPrint className="size-3.5" aria-hidden /> {profile.pets ? "Pets" : "No pets"}
          </span>
        </li>
      </ul>

      {profile.preferences.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.preferences.map((p) => (
            <span key={p.preferenceId} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {p.name}
            </span>
          ))}
        </div>
      )}

      {match && (
        <div className="mt-auto space-y-1.5 border-t pt-4">
          {BREAKDOWN.map((b) => (
            <div key={b.key} className="flex items-center gap-2 text-xs">
              <span className="w-20 text-muted-foreground">{b.label}</span>
              <span className="h-1.5 flex-1 rounded-full bg-muted">
                <span className="block h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, (match.breakdown[b.key] / b.max) * 100)}%` }} />
              </span>
              <span className="w-10 text-right font-medium">
                {match.breakdown[b.key]}/{b.max}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
