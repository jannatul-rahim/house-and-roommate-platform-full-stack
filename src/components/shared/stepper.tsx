import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Horizontal progress indicator for wizard-style forms. */
export function Stepper({ steps, current }: { steps: readonly { id: string; title: string }[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary text-primary",
                !done && !active && "border-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="size-4" /> : index + 1}
            </span>
            <span className={cn("hidden text-sm font-medium md:inline", active ? "text-foreground" : "text-muted-foreground")}>{step.title}</span>
            {index < steps.length - 1 && <span className={cn("h-0.5 flex-1 rounded-full", done ? "bg-primary" : "bg-muted")} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
