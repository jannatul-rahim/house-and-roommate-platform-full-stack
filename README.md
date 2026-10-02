# NestMate — Housing & Roommate Platform (Frontend)

NestMate is the Next.js frontend for the **PH-6 Housing & Roommate Platform** API. Tenants search rooms, book viewings, apply, sign leases, pay rent with **Stripe**, split utility bills, report maintenance and find compatible roommates. Owners list and manage properties. Admins oversee the whole platform.

> Backend repository: `assaignment-6-level-3/PH-6-Housing-and-Roommate-Platform-Backend` (Express + Prisma + PostgreSQL + Stripe).

## 🌐 Live

| | URL |
|---|---|
| **Frontend** | https://house-and-roommate-frontend.vercel.app |
| **Backend API** | https://housing-and-rommate-platform-backen.vercel.app/api/v1 |

---

## 🔐 Demo credentials

The login page has a one-click **Demo Login** button for each role. You can also sign in manually:

| Role | Dashboard | Email | Password |
|---|---|---|---|
| **Admin** | `/admin` | `admin@housing.local` | _the backend's `ADMIN_PASSWORD` (provided with the submission)_ |
| **Provider (Owner)** | `/provider` | `owner.demo@nestmate.app` | `OwnerDemo@2026` |
| **User (Tenant)** | `/dashboard` | `tenant.demo@nestmate.app` | `TenantDemo@2026` |

**Stripe test card:** `4242 4242 4242 4242`, any future expiry, any CVC.

---

## 🛠️ Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict, no `any`) |
| Styling / UI | Tailwind CSS v4, shadcn/ui (Radix primitives), Lucide icons, next-themes (light/dark) |
| Server state | TanStack Query v5 (caching, `keepPreviousData` pagination, global error toasts) |
| Client state | Zustand (signed-in user, mobile navigation) |
| Forms | React Hook Form + Zod. Schemas mirror the backend's validation rules. |
| Auth | Backend JWT pair stored in **HttpOnly cookies on the frontend origin**. Route protection in `src/proxy.ts`, Next 16's renamed `middleware.ts`. |
| Payments | Stripe Checkout (test mode): initiation, `/payments/success` and `/payments/cancel` |
| Charts | Recharts, using a palette validated for colour-blind safety in both light and dark mode |
| Notifications | Sonner |
| Images | `next/image` everywhere, including avatars |

---

## 🧭 Architecture highlights

- **Backend-for-frontend proxy.** Browser code calls `/api/proxy/<api-path>`. The route handler attaches the access token from an HttpOnly cookie, so tokens never reach JavaScript and CORS doesn't matter.
- **Silent refresh.**
  - `proxy.ts` refreshes an expired access token on real navigations. It skips prefetches, because the API treats a replayed refresh token as theft.
  - In the browser, a single-flight refresh means parallel 401s share one refresh call.
- **Defence in depth.**
  - Route level: `proxy.ts` guards `/admin` (ADMIN), `/provider` (OWNER) and `/dashboard` (TENANT).
  - Dashboard layouts re-check the role server-side through `GET /auth/me`.
  - The UI only renders actions a role can perform.
- **Server Components by default.** Public pages, dashboard overviews and analytics render on the server, with ISR for public data. Interactive lists and forms are client components.
- **URL state everywhere.** Every filter, search, sort, tab and page number lives in the query string through `useQueryParams`, for example `/dashboard/payments?status=PAID&sort=amount:desc&page=2`.
- **Loading and error states.**
  - Every data route has a `loading.tsx` skeleton.
  - `error.tsx` boundaries exist at the root, the public segment and each dashboard, plus a `global-error.tsx`.
  - API failures raise Sonner toasts through the global TanStack Query caches.

### Reusable building blocks

- **Components:** `DataTable`, `StatusBadge`, `StatCard`, `SearchInput`, `FilterSelect`, `PaginationControls`, `EmptyState`, `ConfirmDialog`, `FormDialog` (a schema-driven RHF + Zod dialog), `Stepper`, chart components.
- **Hooks:** `useQueryParams`, `useDebounce`, `useSession` / `useLogin` / `useDemoLogin` / `useLogout`, `useListQuery`, `useApiAction`, `usePayRent`.

---

## 📄 Pages (40 page routes + custom 404)

| Area | Routes |
|---|---|
| **Public** | `/` · `/properties` (search with filters) · `/properties/[id]` · `/services` · `/about` · `/faq` · `/contact` |
| **Auth** | `/login` (with one-click demo login) · `/register` |
| **Tenant** | `/dashboard` (activity) · `/dashboard/viewings` · `/dashboard/applications` · `/dashboard/leases` (pay rent) · `/dashboard/payments` · `/dashboard/bills` · `/dashboard/maintenance` · `/dashboard/roommates` · `/dashboard/roommate-profile` (5-step wizard) · `/dashboard/profile` |
| **Provider** | `/provider` (overview and charts) · `/provider/properties` · `/provider/properties/new` (5-step wizard) · `/provider/properties/[id]` (buildings, units, rooms, availability) · `/provider/requests` · `/provider/leases` · `/provider/earnings` · `/provider/maintenance` · `/provider/bills` · `/provider/profile` (profile and listing availability) |
| **Admin** | `/admin` (analytics) · `/admin/properties` (moderation) · `/admin/bookings` · `/admin/payments` · `/admin/maintenance` · `/admin/preferences` (CRUD) · `/admin/reports` (audit logs) · `/admin/tenants` · `/admin/profile` |
| **Payment** | `/payments/success` · `/payments/cancel` |
| **Utility** | custom `not-found.tsx` · `error.tsx` / `global-error.tsx` · `sitemap.xml` · `robots.txt` |

---

## 🚀 Getting started

### 1. Run the backend

```bash
cd ../assaignment-6-level-3/PH-6-Housing-and-Roommate-Platform-Backend
pnpm install
PORT=5050 pnpm dev   # macOS reserves port 5000 for AirPlay
```

The backend's `FRONTEND_URL` must be `http://localhost:3000`. Stripe uses it for the success and cancel redirects.

### 2. Run the frontend

```bash
pnpm install
cp .env.example .env.local   # then set DEMO_ADMIN_PASSWORD
pnpm dev
```

Open <http://localhost:3000>.

### 3. (Optional) Seed demo data

The script creates the demo owner and tenant accounts plus realistic listings, a viewing → application → lease flow, bills, maintenance tickets and roommate profiles. It goes through the real API.

```bash
pnpm seed:demo
```

### Environment variables

| Variable | Purpose |
|---|---|
| `API_BASE_URL` | Backend base URL. Server-only, e.g. `http://localhost:5050/api/v1`. |
| `NEXT_PUBLIC_SITE_URL` | Public URL used for metadata, sitemap and Open Graph. |
| `DEMO_*_EMAIL` / `DEMO_*_PASSWORD` | Credentials used by the one-click demo buttons. Server-only. |

### Scripts

`pnpm dev` · `pnpm build` · `pnpm start` · `pnpm lint` · `pnpm typecheck` · `pnpm seed:demo`

---

## 🔧 Backend change

One small, additive change was required in the backend: `GET /properties/:id` now also returns the property's available **rooms**, with their ids, type, rent, deposit, unit info and availability windows.

Without it, a tenant had no way to get a `roomId`. The room endpoints are restricted to owners and managers, and the public detail response dropped the rooms, so tenants could not request a viewing or apply. The list endpoint and all other responses are unchanged.

---

## 📝 Notes

- The API stores no property photos, so listings are illustrated with curated Unsplash photography matched to the property type. The photo is chosen deterministically per listing.
- The API has no "list users" or analytics endpoints. Admin analytics and the tenant directory are computed from the platform-wide `managed` endpoints, which return every record to admins.
- A rent payment moves to **Paid** when Stripe's webhook reaches the backend. Locally, run `stripe listen --forward-to localhost:5050/api/v1/payments/webhook/stripe`.
