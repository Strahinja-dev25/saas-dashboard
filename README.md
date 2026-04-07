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

NEXT*PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test*...
CLERK*SECRET_KEY=sk_test*...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
\`\`\`

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
Open[http://localhost:3000](http://localhost:3000) in your browser. The app will automatically redirect you to the Clerk login screen.

---

_Designed & Developed as a showcase of Full-Stack engineering and enterprise software architecture._
