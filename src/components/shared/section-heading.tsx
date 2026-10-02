import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, center, className }: { eyebrow: string; title: string; description?: string; center?: boolean; className?: string }) {
  return (
    <div className={cn("space-y-3", center && "mx-auto max-w-2xl text-center", className)}>
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>
      <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" aria-hidden />
      <div className="absolute -top-32 right-0 -z-10 size-96 rounded-full bg-primary/15 blur-3xl" aria-hidden />
      <div className="container-page space-y-4 py-16 text-center sm:py-20">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>
        <h1 className="mx-auto max-w-3xl font-heading text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{title}</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
