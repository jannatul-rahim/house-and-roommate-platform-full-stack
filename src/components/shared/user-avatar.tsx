"use client";

import Image from "next/image";
import { useState } from "react";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

// Must mirror images.remotePatterns in next.config.ts - next/image throws for other hosts.
const ALLOWED_HOSTS = [".r2.dev", ".googleusercontent.com", "images.unsplash.com"];

function isAllowed(src: string): boolean {
  try {
    const { protocol, hostname } = new URL(src);
    return protocol === "https:" && ALLOWED_HOSTS.some((h) => (h.startsWith(".") ? hostname.endsWith(h) : hostname === h));
  } catch {
    return false;
  }
}

/** Round avatar: optimized photo via next/image, initials when missing or broken. */
export function UserAvatar({ name, image, className }: { name: string; image?: string | null; className?: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = !!image && !failed && isAllowed(image);

  return (
    <span className={cn("relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary", className)}>
      {showImage ? (
        <Image src={image} alt={name} fill sizes="96px" className="object-cover" onError={() => setFailed(true)} />
      ) : (
        <span aria-label={name}>{initials(name)}</span>
      )}
    </span>
  );
}
