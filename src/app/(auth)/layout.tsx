import { Quote } from "lucide-react";
import Image from "next/image";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { marketingPhotos } from "@/lib/property-media";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col">
        <header className="flex items-center justify-between p-4 sm:p-6">
          <Logo />
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-6">{children}</main>
      </div>
      <div className="relative hidden overflow-hidden lg:block">
        <Image src={marketingPhotos.about} alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-primary/20" />
        <figure className="absolute inset-x-10 bottom-10 space-y-4 text-white">
          <Quote className="size-8 text-amber-300" aria-hidden />
          <blockquote className="font-heading text-2xl leading-snug font-semibold">
            Viewings, leases and rent in one place — moving into a shared flat has never been this calm.
          </blockquote>
          <figcaption className="text-sm text-white/80">The NestMate promise to every tenant and owner</figcaption>
        </figure>
      </div>
    </div>
  );
}
