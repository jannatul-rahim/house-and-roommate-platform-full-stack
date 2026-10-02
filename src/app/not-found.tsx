import { Compass, Home, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" aria-hidden />
      <header className="container-page py-5">
        <Logo />
      </header>
      <main className="container-page flex flex-1 flex-col items-center justify-center gap-6 pb-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="size-8" aria-hidden />
        </span>
        <p className="font-heading text-7xl font-extrabold tracking-tight text-primary sm:text-8xl">404</p>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">This room doesn&apos;t exist</h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            The page you&apos;re looking for has moved, been unpublished, or never existed. Let&apos;s get you back home.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" className="h-11 px-6" asChild>
            <Link href="/">
              <Home /> Back to home
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-11 px-6" asChild>
            <Link href="/properties">
              <Search /> Browse rooms
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
