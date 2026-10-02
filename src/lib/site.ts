export const siteConfig = {
  name: "NestMate",
  description:
    "NestMate is a housing and roommate platform for Bangladesh. Browse verified rooms, book viewings, sign leases, pay rent securely with Stripe and match with compatible roommates.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supportEmail: "support@nestmate.app",
} as const;
