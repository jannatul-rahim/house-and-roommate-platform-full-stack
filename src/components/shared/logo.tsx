import { Home } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group flex items-center gap-2 font-heading text-lg font-extrabold tracking-tight", className)}>
      <span className="relative flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30 transition-transform group-hover:-rotate-6">
        <Home className="size-4.5" strokeWidth={2.5} aria-hidden />
        <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-amber-400 ring-2 ring-background" aria-hidden />
      </span>
      <span>
        Nest<span className="text-primary">Mate</span>
      </span>
      <span className="sr-only">{siteConfig.name} home</span>
    </Link>
  );
}
