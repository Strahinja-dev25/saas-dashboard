# 🚛 TMS - Transportation Management System

A modern, production-ready B2B SaaS dashboard built specifically for the US trucking logistics industry. The system provides dispatchers with complete control over fleet operations, driver management, active load routing, and ELD/HOS compliance tracking.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components)
- **Language:** TypeScript
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** Prisma
- **Authentication:** Clerk (with Role-Based Access Control)
- **Styling:** Tailwind CSS + shadcn/ui
- **Validation:** Zod

## 🏗️ Architecture & Core Principles

This project abandons the "spaghetti code" approach and implements a strict **Service-Layer Architecture (CQRS principles)**:

1.  **View Layer (`page.tsx`):** Clean, logic-less components responsible only for rendering data and catching URL search parameters.
2.  **Controller Layer (`actions.ts`):** Thin Server Actions acting as bridges and ensuring strict Zod validation before backend execution.
3.  **Data Access Layer (`services/`):** Heavy business logic, relational Prisma queries, and multi-tenant security limits (`companyId` checks) live exclusively here.

## 🔥 Key Business Features

### 1. Intelligent Fleet & Driver Management

- **State Machine Logistics:** Trucks and drivers undergo strict status validation. A dispatcher cannot assign a driver to a truck in `MAINTENANCE` status.
- **HOS & ELD Compliance:** The system prevents the start of a trip if the driver's ELD is `DISCONNECTED` or if they lack sufficient Hours of Service (HOS) to complete the estimated trip route.

### 2. Advanced Load Dispatching

- **Lifecycle Management:** Loads track precise operational stages (`PENDING` -> `ASSIGNED` -> `IN_TRANSIT` -> `DELIVERED`).
- **Transactional Integrity:** Leveraging `db.$transaction`, resolving a load (Delivered/Cancelled) automatically recalculates driver's HOS, alters truck status to `AVAILABLE`, and unassigns active units cleanly to prevent data ghosting.

### 3. Dynamic UX & Data Handling

- **URL as State:** Deep-linkable Search, Pagination, and Column Sorting natively controlled via URL Search Parameters, allowing lightning-fast Server-Side Rendering (SSR).
- **Multi-tenancy isolation:** B2B application infrastructure prepared for multiple organizations under a single database using Clerk ID mapping.

---

## 💻 Local Development Setup

Follow these steps to run the project locally on your machine.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended) and a [PostgreSQL](https://www.postgresql.org/) database (you can use Supabase or Neon.tech for a free cloud database). You will also need a [Clerk](https://clerk.com/) account for authentication.

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/YourUsername/saas-dashboard.git
cd saas-dashboard
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set up Environment Variables

Create a `.env` file in the root directory and add your specific keys:

\`\`\`env

# Database

DATABASE_URL="postgresql://user:password@host:port/db_name"

# Clerk Authentication

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
\`\`\`

> **Note:** There is no public sign-up. All accounts are created manually by an administrator (see below).

### 4. Initialize Database

Push the schema to your database and generate the Prisma Client:
\`\`\`bash
npx prisma db push
npx prisma generate
\`\`\`

### 5. Start the Application

\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser. Unauthenticated visitors see the public landing page at `/`. After sign-in, users are redirected to `/dashboard`.

---

## 🔐 Admin: Manual User Onboarding

This application has **no self-service sign-up**. Every dispatcher account must be created manually in two places: **Clerk** (authentication) and **PostgreSQL** (company access).

### What goes where

| Field | Clerk | Database (`User` table) |
|-------|-------|-------------------------|
| Username | ✅ Required | ✅ Required (must match) |
| Password | ✅ Required | ❌ Never stored in DB |
| Company ID | ❌ | ✅ Required (`companyId`) |
| Clerk User ID | Auto-generated | ✅ Required (`clerkId`) |
| Role | ❌ | ✅ Required (`ADMIN`, `DISPATCHER`, or `DRIVER`) |
| Email | ❌ Not used | ❌ Not used |

> **Username uniqueness:** Usernames must be unique across the entire Clerk application. Two companies cannot share the same username (e.g. use `abc_jovan` and `xyz_jovan`).

### Step-by-step process

#### 1. Ensure the company exists in the database

If the company is new, create a row in the `Company` table first (via Supabase SQL editor, Prisma Studio, or SQL):

\`\`\`sql
INSERT INTO "Company" (id, name, "createdAt", "updatedAt")
VALUES ('firma-2', 'ABC Transport', NOW(), NOW());
\`\`\`

Note the `id` value — you will need it as `companyId` when creating the user.

#### 2. Create the user in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Users** → **Create user**
2. Enter the **username** (e.g. `abc_dispatcher1`)
3. After creation, open the user profile and click **Set password** to assign their password
4. Copy the **User ID** from the profile (format: `user_2abc...`) — this is the `clerkId`

Also confirm in **Configure → User & Authentication**:
- **Username** and **Password** are enabled
- **Email** sign-up is disabled
- **Sign-up** / self-registration is restricted (admin-only access)

#### 3. Create the matching row in PostgreSQL

Insert a row into the `User` table linking the Clerk account to a company:

\`\`\`sql
INSERT INTO "User" (id, username, "clerkId", "companyId", role, "createdAt", "updatedAt")
VALUES (
  'clxxxxxxxx',           -- generate a unique cuid or use gen_random_uuid()
  'abc_dispatcher1',      -- same username as in Clerk
  'user_2abc...',         -- Clerk User ID from step 2
  'firma-2',              -- Company id from step 1
  'DISPATCHER',
  NOW(),
  NOW()
);
\`\`\`

#### 4. User can now log in

1. Visit `/` → click **Uloguj se**
2. Sign in at `/sign-in` with username + password
3. Redirected to `/dashboard` with data scoped to their `companyId`

### Route overview

| URL | Who can access | Purpose |
|-----|----------------|---------|
| `/` | Everyone (public) | Landing page |
| `/sign-in` | Everyone (public) | Login |
| `/dashboard` | Authenticated only | Dashboard overview |
| `/fleet`, `/loads`, etc. | Authenticated only | App modules |

---

_Designed & Developed as a showcase of Full-Stack engineering and enterprise software architecture._
