"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  homeHref?: string;
}

/** Body for every `error.tsx` boundary: friendly copy, retry, and a toast. */
export function ErrorState({ error, reset, homeHref = "/" }: ErrorStateProps) {
  useEffect(() => {
    toast.error("Something went wrong while loading this page.");
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-8" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold">We hit a snag</h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          This page couldn&apos;t be loaded right now. It&apos;s usually temporary — try again, or head back home.
        </p>
        {error.digest && <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>
          <RotateCcw /> Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href={homeHref}>
            <Home /> Go home
          </Link>
        </Button>
      </div>
    </div>
  );
}
