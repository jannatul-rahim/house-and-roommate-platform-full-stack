"use client";

import "./globals.css";

/**
 * Last-resort boundary for errors thrown in the root layout itself. It
 * replaces the whole document, so it can't rely on providers or fonts.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center bg-background p-6 font-sans text-foreground">
        <div role="alert" className="max-w-md space-y-4 text-center">
          <p className="text-5xl" aria-hidden>
            🏚️
          </p>
          <h1 className="text-2xl font-bold">NestMate ran into a problem</h1>
          <p className="text-muted-foreground">
            Something went wrong while loading the app. Please try again — if it keeps happening, come back in a few minutes.
          </p>
          {error.digest && <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>}
          <div className="flex justify-center gap-2">
            <button onClick={reset} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full reload is intended here */}
            <a href="/" className="rounded-lg border px-4 py-2 text-sm font-medium">
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
