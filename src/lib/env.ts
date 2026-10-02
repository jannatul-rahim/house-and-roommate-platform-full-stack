import "server-only";

/**
 * Server-only configuration. The backend URL never reaches the browser:
 * client components talk to `/api/proxy/*`, which forwards with the session.
 */
export const env = {
  apiBaseUrl: (process.env.API_BASE_URL ?? "http://localhost:5050/api/v1").replace(/\/$/, ""),
  isProduction: process.env.NODE_ENV === "production",
  demo: {
    ADMIN: {
      email: process.env.DEMO_ADMIN_EMAIL ?? "",
      password: process.env.DEMO_ADMIN_PASSWORD ?? "",
    },
    OWNER: {
      email: process.env.DEMO_OWNER_EMAIL ?? "",
      password: process.env.DEMO_OWNER_PASSWORD ?? "",
    },
    TENANT: {
      email: process.env.DEMO_TENANT_EMAIL ?? "",
      password: process.env.DEMO_TENANT_PASSWORD ?? "",
    },
  },
} as const;
