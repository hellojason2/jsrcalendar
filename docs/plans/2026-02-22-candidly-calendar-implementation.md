# Candidly Calendar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a timezone-aware group scheduling app with dark glassmorphic UI, animated flip clock, guest invite system via universal share link, and drag-to-paint availability grid with heatmap.

**Architecture:** Next.js 14 App Router with Server Components for data fetching, Client Components for interactivity, Server Actions for mutations. PostgreSQL via Prisma for storage. All datetimes UTC in DB, converted client-side only. Single universal share link (`/m/[shareToken]`) adapts UI based on viewer role (creator/user/guest).

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Prisma, PostgreSQL, NextAuth.js, Resend, date-fns-tz, Zod

**Design doc:** `docs/plans/2026-02-22-candidly-calendar-design.md`

---

## Phase 1: Project Scaffold & Database

### Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`

**Step 1: Scaffold the project**

```bash
cd /Users/thuanle/Documents/JSR/JSRcalendar
npx create-next-app@14 . --typescript --tailwind --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. This creates the Next.js 14 skeleton.

**Step 2: Install all dependencies**

```bash
npm install prisma @prisma/client next-auth@4 @auth/prisma-adapter bcryptjs zod date-fns date-fns-tz resend @react-email/components react-hot-toast framer-motion
npm install -D @types/bcryptjs
```

**Step 3: Initialize shadcn/ui**

```bash
npx shadcn-ui@latest init
```

Choose: TypeScript, Default style, Slate base color, CSS variables, `src/app/globals.css`, `tailwind.config.ts`, `@/components`, `@/lib/utils`.

**Step 4: Add shadcn/ui components we'll need**

```bash
npx shadcn-ui@latest add button card input label dialog sheet badge separator dropdown-menu avatar tooltip popover command calendar
```

**Step 5: Initialize Prisma**

```bash
npx prisma init
```

**Step 6: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 14 project with dependencies"
```

---

### Task 2: Tailwind dark glassmorphic theme

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`
- Create: `src/lib/cn.ts`

**Step 1: Configure Tailwind for our design system**

Replace `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1120",
        surface: "rgba(255, 255, 255, 0.05)",
        "surface-hover": "rgba(255, 255, 255, 0.08)",
        "surface-active": "rgba(255, 255, 255, 0.12)",
        border: "rgba(255, 255, 255, 0.1)",
        "border-hover": "rgba(255, 255, 255, 0.2)",
        primary: {
          DEFAULT: "#6366F1",
          light: "#818CF8",
          dark: "#4F46E5",
        },
        violet: {
          DEFAULT: "#8B5CF6",
          light: "#A78BFA",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        "text-primary": "#F1F5F9",
        "text-secondary": "#94A3B8",
        "text-muted": "#64748B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backdropBlur: {
        glass: "20px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
        "glass-hover": "0 12px 40px rgba(0, 0, 0, 0.4)",
        glow: "0 0 20px rgba(99, 102, 241, 0.3)",
        "glow-lg": "0 0 40px rgba(99, 102, 241, 0.4)",
      },
      borderRadius: {
        glass: "16px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite alternate",
      },
      keyframes: {
        "glow-pulse": {
          "0%": { boxShadow: "0 0 10px rgba(99, 102, 241, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(99, 102, 241, 0.5)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

**Step 2: Set up globals.css with glass utilities**

Replace `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

@layer base {
  :root {
    --background: 222 47% 9%;
    --foreground: 210 40% 96%;
    --card: 222 47% 9%;
    --card-foreground: 210 40% 96%;
    --popover: 222 47% 11%;
    --popover-foreground: 210 40% 96%;
    --primary: 239 84% 67%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 96%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 96%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 239 84% 67%;
    --radius: 0.75rem;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-text-primary font-sans antialiased;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }
}

@layer components {
  .glass-card {
    @apply bg-surface backdrop-blur-glass border border-border rounded-glass shadow-glass;
  }

  .glass-card-hover {
    @apply glass-card transition-all duration-300 ease-out;
  }

  .glass-card-hover:hover {
    @apply bg-surface-hover border-border-hover shadow-glass-hover;
    transform: translateY(-2px);
  }

  .glass-card-active {
    @apply glass-card border-primary/30 shadow-glow;
  }

  .glass-pill {
    @apply px-3 py-1 rounded-full text-xs font-medium backdrop-blur-glass border;
  }

  .gradient-text {
    @apply bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent;
  }

  .gradient-bg {
    @apply bg-gradient-to-r from-primary to-violet;
  }

  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: configure dark glassmorphic design system with Tailwind"
```

---

### Task 3: Prisma schema & database setup

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `.env.local`
- Create: `src/lib/prisma.ts`

**Step 1: Write the Prisma schema**

Replace `prisma/schema.prisma` with the full schema from the blueprint, plus the guest fields:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  firstName     String
  lastName      String
  passwordHash  String
  timezone      String   @default("UTC")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  meetingsCreated  Meeting[]       @relation("MeetingCreator")
  participants     Participant[]
  availabilities   Availability[]
}

model Meeting {
  id            String        @id @default(cuid())
  title         String
  description   String?
  location      String?
  duration      Int
  type          MeetingType   @default(POLL)
  status        MeetingStatus @default(PENDING)

  proposedTime  DateTime?
  dateRangeStart DateTime?
  dateRangeEnd   DateTime?
  confirmedTime DateTime?

  creatorId     String
  creator       User          @relation("MeetingCreator", fields: [creatorId], references: [id])

  shareToken    String        @unique @default(cuid())

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  participants  Participant[]
  timeSlots     TimeSlot[]
}

enum MeetingType {
  FIXED
  POLL
}

enum MeetingStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

model Participant {
  id          String            @id @default(cuid())
  meetingId   String
  meeting     Meeting           @relation(fields: [meetingId], references: [id], onDelete: Cascade)

  userId      String?
  user        User?             @relation(fields: [userId], references: [id])
  guestEmail  String?
  guestName   String?

  isGuest     Boolean           @default(false)
  guestToken  String?           @unique @default(cuid())

  status      ParticipantStatus @default(PENDING)
  timezone    String            @default("UTC")
  accessToken String            @unique @default(cuid())

  respondedAt DateTime?
  createdAt   DateTime          @default(now())

  availabilities Availability[]

  @@unique([meetingId, userId])
  @@unique([meetingId, guestEmail])
}

enum ParticipantStatus {
  PENDING
  AVAILABLE
  UNAVAILABLE
  RESPONDED
}

model TimeSlot {
  id          String   @id @default(cuid())
  meetingId   String
  meeting     Meeting  @relation(fields: [meetingId], references: [id], onDelete: Cascade)

  startTime   DateTime
  endTime     DateTime

  createdAt   DateTime @default(now())

  availabilities Availability[]
}

model Availability {
  id            String    @id @default(cuid())
  participantId String
  participant   Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)

  userId        String?
  user          User?     @relation(fields: [userId], references: [id])

  timeSlotId    String?
  timeSlot      TimeSlot? @relation(fields: [timeSlotId], references: [id], onDelete: Cascade)

  startTime     DateTime?
  endTime       DateTime?

  isAvailable   Boolean   @default(true)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([participantId, timeSlotId])
}
```

**Step 2: Create .env.local**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/candidly"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-change-in-production-abc123"
RESEND_API_KEY=""
EMAIL_FROM="noreply@candidly.app"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Step 3: Create Prisma client singleton**

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Step 4: Run migration**

```bash
npx prisma migrate dev --name init
```

**Step 5: Generate client**

```bash
npx prisma generate
```

**Step 6: Commit**

```bash
git add prisma/ src/lib/prisma.ts
git commit -m "feat: add Prisma schema with User, Meeting, Participant, TimeSlot, Availability models"
```

Note: Do NOT commit `.env.local` — ensure `.gitignore` includes it.

---

### Task 4: Timezone utilities

**Files:**
- Create: `src/lib/timezone.ts`
- Create: `src/lib/validators.ts`

**Step 1: Create timezone utility functions**

Create `src/lib/timezone.ts`:

```typescript
import { format, utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

/**
 * Convert a user's local time to UTC for storage.
 */
export function localToUTC(localTime: Date, timezone: string): Date {
  return zonedTimeToUtc(localTime, timezone);
}

/**
 * Convert UTC from DB to user's local time for display.
 */
export function utcToLocal(utcTime: Date, timezone: string): Date {
  return utcToZonedTime(utcTime, timezone);
}

/**
 * Format a UTC time in the user's timezone.
 */
export function formatInTimezone(
  utcTime: Date,
  timezone: string,
  formatStr: string = "MMM d, yyyy h:mm a"
): string {
  const zonedTime = utcToZonedTime(utcTime, timezone);
  return format(zonedTime, formatStr, { timeZone: timezone });
}

/**
 * Get offset string like "UTC+7" or "UTC-5".
 */
export function getTimezoneOffset(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(now);
  const offsetPart = parts.find((p) => p.type === "timeZoneName");
  return offsetPart?.value ?? "UTC";
}

/**
 * Get short timezone abbreviation like "PST", "ICT".
 */
export function getTimezoneAbbreviation(timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  });
  const parts = formatter.formatToParts(new Date());
  return parts.find((p) => p.type === "timeZoneName")?.value ?? timezone;
}

/**
 * Get a human-friendly city name from IANA timezone.
 * "America/New_York" → "New York"
 * "Asia/Ho_Chi_Minh" → "Ho Chi Minh"
 */
export function getTimezoneCityName(timezone: string): string {
  const city = timezone.split("/").pop() ?? timezone;
  return city.replace(/_/g, " ");
}

/**
 * Common IANA timezones grouped by region for the selector.
 */
export const TIMEZONE_GROUPS = {
  Americas: [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Anchorage",
    "Pacific/Honolulu",
    "America/Toronto",
    "America/Vancouver",
    "America/Mexico_City",
    "America/Sao_Paulo",
    "America/Argentina/Buenos_Aires",
    "America/Bogota",
    "America/Lima",
  ],
  "Europe & Africa": [
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Amsterdam",
    "Europe/Madrid",
    "Europe/Rome",
    "Europe/Stockholm",
    "Europe/Zurich",
    "Europe/Moscow",
    "Europe/Istanbul",
    "Africa/Cairo",
    "Africa/Lagos",
    "Africa/Johannesburg",
  ],
  "Asia & Pacific": [
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Dhaka",
    "Asia/Bangkok",
    "Asia/Ho_Chi_Minh",
    "Asia/Jakarta",
    "Asia/Singapore",
    "Asia/Shanghai",
    "Asia/Hong_Kong",
    "Asia/Seoul",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Australia/Melbourne",
    "Pacific/Auckland",
  ],
} as const;

/**
 * Flat list of all timezone options with metadata.
 */
export function getAllTimezoneOptions() {
  const options: Array<{
    value: string;
    label: string;
    city: string;
    offset: string;
    abbreviation: string;
    region: string;
  }> = [];

  for (const [region, zones] of Object.entries(TIMEZONE_GROUPS)) {
    for (const tz of zones) {
      options.push({
        value: tz,
        label: `${getTimezoneCityName(tz)} (${getTimezoneOffset(tz)})`,
        city: getTimezoneCityName(tz),
        offset: getTimezoneOffset(tz),
        abbreviation: getTimezoneAbbreviation(tz),
        region,
      });
    }
  }

  return options;
}
```

**Step 2: Create Zod validators**

Create `src/lib/validators.ts`:

```typescript
import { z } from "zod";

export const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    timezone: z.string().default("UTC"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  location: z.string().max(500).optional(),
  duration: z.number().min(15).max(480),
  type: z.enum(["FIXED", "POLL"]),
  proposedTime: z.string().datetime().optional(),
  dateRangeStart: z.string().datetime().optional(),
  dateRangeEnd: z.string().datetime().optional(),
  timeSlots: z
    .array(
      z.object({
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
      })
    )
    .optional(),
  invitees: z.array(
    z.object({
      email: z.string().email(),
      name: z.string().optional(),
    })
  ),
});

export const guestJoinSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email().optional().or(z.literal("")),
});

export const submitAvailabilitySchema = z.object({
  timezone: z.string(),
  availabilities: z.array(
    z.object({
      startTime: z.string().datetime(),
      endTime: z.string().datetime(),
      isAvailable: z.boolean(),
    })
  ),
});

export const fixedResponseSchema = z.object({
  available: z.boolean(),
  timezone: z.string(),
  message: z.string().max(500).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type GuestJoinInput = z.infer<typeof guestJoinSchema>;
export type SubmitAvailabilityInput = z.infer<typeof submitAvailabilitySchema>;
export type FixedResponseInput = z.infer<typeof fixedResponseSchema>;
```

**Step 3: Commit**

```bash
git add src/lib/timezone.ts src/lib/validators.ts
git commit -m "feat: add timezone utilities and Zod validation schemas"
```

---

## Phase 2: Auth System

### Task 5: NextAuth configuration

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/api/auth/signup/route.ts`
- Create: `src/types/next-auth.d.ts`

**Step 1: Create NextAuth type extension**

Create `src/types/next-auth.d.ts`:

```typescript
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    timezone: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      timezone: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    timezone: string;
  }
}
```

**Step 2: Create auth config**

Create `src/lib/auth.ts`:

```typescript
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          timezone: user.timezone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.timezone = user.timezone;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.timezone = token.timezone;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
```

**Step 3: Create NextAuth route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Step 4: Create signup API route**

Create `src/app/api/auth/signup/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = signupSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash,
        timezone: data.timezone,
      },
    });

    return NextResponse.json(
      { id: user.id, email: user.email },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Step 5: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/ src/types/
git commit -m "feat: add NextAuth.js credentials auth with signup endpoint"
```

---

### Task 6: Auth pages (Login + Signup)

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/signup/page.tsx`
- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/components/auth/SignupForm.tsx`

**Step 1: Create auth layout** — minimal, centered, no sidebar

Create `src/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
```

**Step 2: Build SignupForm component**

Create `src/components/auth/SignupForm.tsx`:

A client component with:
- Glass card container
- Fields: firstName, lastName, email, password, confirmPassword
- Auto-detected timezone display with "Change" link → opens TimezoneSelector
- Zod validation on submit
- Calls `POST /api/auth/signup` then `signIn("credentials", ...)`
- Loading state on button, toast on error
- Framer Motion fade-in on mount
- Link to login at bottom

**Step 3: Build LoginForm component**

Create `src/components/auth/LoginForm.tsx`:

A client component with:
- Glass card container
- Fields: email, password
- Calls `signIn("credentials", { redirect: true, callbackUrl: "/dashboard" })`
- Loading state, error toast
- Link to signup at bottom

**Step 4: Create page files**

Create `src/app/(auth)/signup/page.tsx`:
```tsx
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return <SignupForm />;
}
```

Create `src/app/(auth)/login/page.tsx`:
```tsx
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return <LoginForm />;
}
```

**Step 5: Test** — Run `npm run dev`, navigate to `/signup`, create account, verify redirect to `/dashboard` (will be 404 for now, that's fine). Then `/login` and log in.

**Step 6: Commit**

```bash
git add src/app/\(auth\)/ src/components/auth/
git commit -m "feat: add login and signup pages with glass card UI"
```

---

## Phase 3: Core UI Components

### Task 7: TimezoneProvider + FlipClock

**Files:**
- Create: `src/components/timezone/TimezoneProvider.tsx`
- Create: `src/components/timezone/FlipClock.tsx`
- Create: `src/components/timezone/TimezoneSelector.tsx`
- Create: `src/components/timezone/LocalTime.tsx`
- Create: `src/hooks/useTimezone.ts`

**Step 1: Build TimezoneProvider**

Create `src/components/timezone/TimezoneProvider.tsx`:

Client component using `createContext`. On mount:
1. Check `localStorage.getItem("candidly_timezone")`
2. If not found, use `Intl.DateTimeFormat().resolvedOptions().timeZone`
3. Expose `{ timezone, setTimezone, isAutoDetected }` via context
4. `setTimezone` saves to localStorage and optionally PATCHes user profile

**Step 2: Build FlipClock**

Create `src/components/timezone/FlipClock.tsx`:

Client component:
- Updates every second via `useEffect` + `setInterval`
- Each digit (HH:MM:SS) in its own `<AnimatePresence>` with `motion.span`
- Transition: `initial={{ y: -20, opacity: 0 }}`, `animate={{ y: 0, opacity: 1 }}`, `exit={{ y: 20, opacity: 0 }}`, `transition={{ type: "spring", stiffness: 300, damping: 25 }}`
- Colon separators: `motion.span` with `animate={{ opacity: [1, 0.3, 1] }}` repeating every 1s
- AM/PM badge: glass pill with gradient background
- Below the clock: glass pill badge showing `🌏 {city} · {offset} · {abbreviation}`
- Font: text-6xl font-extralight tabular-nums tracking-tight text-text-primary
- Timezone badge: text-xs uppercase tracking-widest text-text-secondary

**Step 3: Build TimezoneSelector**

Create `src/components/timezone/TimezoneSelector.tsx`:

Client component using shadcn `Command` (combobox):
- Searchable by city name, country, timezone ID
- Grouped by region (Americas, Europe & Africa, Asia & Pacific)
- Each option shows: city name + current local time + offset
- On select → calls `setTimezone` from context
- Opens in a `Popover` or `Dialog`

**Step 4: Build LocalTime**

Create `src/components/timezone/LocalTime.tsx`:

```tsx
"use client";

import { useTimezone } from "@/hooks/useTimezone";
import { formatInTimezone, getTimezoneAbbreviation } from "@/lib/timezone";

interface LocalTimeProps {
  utcTime: Date | string;
  format?: string;
  showTimezone?: boolean;
}

export function LocalTime({
  utcTime,
  format = "MMM d, yyyy h:mm a",
  showTimezone = false,
}: LocalTimeProps) {
  const { timezone } = useTimezone();
  const date = typeof utcTime === "string" ? new Date(utcTime) : utcTime;
  const formatted = formatInTimezone(date, timezone, format);
  const abbr = showTimezone ? ` (${getTimezoneAbbreviation(timezone)})` : "";

  return (
    <span className="tabular-nums">
      {formatted}
      {abbr && <span className="text-text-secondary text-sm">{abbr}</span>}
    </span>
  );
}
```

**Step 5: Create useTimezone hook**

Create `src/hooks/useTimezone.ts`:

```typescript
"use client";

import { useContext } from "react";
import { TimezoneContext } from "@/components/timezone/TimezoneProvider";

export function useTimezone() {
  const ctx = useContext(TimezoneContext);
  if (!ctx) throw new Error("useTimezone must be used within TimezoneProvider");
  return ctx;
}
```

**Step 6: Wrap root layout in TimezoneProvider**

Modify `src/app/layout.tsx` to wrap children in `<TimezoneProvider>`.

**Step 7: Test** — Run dev server, check clock ticks, timezone detection works, selector changes timezone.

**Step 8: Commit**

```bash
git add src/components/timezone/ src/hooks/ src/app/layout.tsx
git commit -m "feat: add TimezoneProvider, animated FlipClock, TimezoneSelector, and LocalTime component"
```

---

### Task 8: Glass card system + shared UI components

**Files:**
- Create: `src/components/ui/glass-card.tsx`
- Create: `src/components/ui/status-badge.tsx`
- Create: `src/components/ui/animated-container.tsx`
- Create: `src/components/ui/bottom-sheet.tsx`

**Step 1: Build GlassCard**

```tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = false, active = false, onClick }: GlassCardProps) {
  const Component = hover ? motion.div : "div";
  return (
    <Component
      className={cn(
        "glass-card p-6",
        hover && "glass-card-hover cursor-pointer",
        active && "glass-card-active",
        className
      )}
      onClick={onClick}
      {...(hover
        ? {
            whileHover: { y: -2, scale: 1.01 },
            whileTap: { scale: 0.99 },
            transition: { type: "spring", stiffness: 300, damping: 25 },
          }
        : {})}
    >
      {children}
    </Component>
  );
}
```

**Step 2: Build StatusBadge**

```tsx
import { cn } from "@/lib/utils";

type BadgeVariant = "creator" | "confirmed" | "pending" | "guest" | "responded" | "unavailable";

const variants: Record<BadgeVariant, string> = {
  creator: "bg-primary/20 text-primary-light border-primary/30",
  confirmed: "bg-success/20 text-success border-success/30",
  pending: "bg-warning/20 text-warning border-warning/30",
  guest: "bg-violet/20 text-violet-light border-violet/30",
  responded: "bg-success/20 text-success border-success/30",
  unavailable: "bg-danger/20 text-danger border-danger/30",
};

export function StatusBadge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  return (
    <span className={cn("glass-pill", variants[variant])}>
      {children}
    </span>
  );
}
```

**Step 3: Build AnimatedContainer** — for stagger-reveal lists

```tsx
"use client";

import { motion } from "framer-motion";

export function AnimatedContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.03 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
      }}
    >
      {children}
    </motion.div>
  );
}
```

**Step 4: Build BottomSheet** — for guest join flow

Use shadcn `Sheet` with Framer Motion spring animation, appearing from bottom. Glass card styling.

**Step 5: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add GlassCard, StatusBadge, AnimatedContainer, and BottomSheet components"
```

---

## Phase 4: Landing Page

### Task 9: Landing page

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/landing/Hero.tsx`
- Create: `src/components/landing/Features.tsx`

**Step 1: Build Hero section**

- Large gradient text headline: "Schedule across timezones, effortlessly"
- Subtitle in text-secondary
- Two CTA buttons: "Get Started" (gradient-bg) and "See How It Works" (glass outline)
- Animated FlipClock component centered below the hero, showing visitor's local time
- Background: subtle gradient radial glow behind the clock
- Framer Motion stagger animation on text + buttons

**Step 2: Build Features section**

Three glass cards in a row showing key features:
1. "One Link, Everyone Responds" — share icon, description of guest mode
2. "See the Best Time" — heatmap icon, description of availability overlap
3. "Timezone Magic" — globe icon, auto-detection + conversion

Each card with hover lift effect and icon with glow.

**Step 3: Assemble landing page**

```tsx
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
    </main>
  );
}
```

**Step 4: Test** — verify page renders, clock ticks, animations work, CTAs link to `/signup` and `/login`.

**Step 5: Commit**

```bash
git add src/app/page.tsx src/components/landing/
git commit -m "feat: add landing page with hero, flip clock, and feature cards"
```

---

## Phase 5: Dashboard

### Task 10: Dashboard layout + page

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/dashboard/page.tsx`
- Create: `src/components/dashboard/Sidebar.tsx`
- Create: `src/components/dashboard/TopBar.tsx`
- Create: `src/components/meetings/MeetingCard.tsx`

**Step 1: Build Sidebar**

Glass card sidebar with:
- Candidly logo at top
- Nav links: Dashboard, Meetings, Settings
- Active state: gradient left border + surface-active background
- User avatar + name at bottom
- Framer Motion layout animation on active indicator

**Step 2: Build TopBar**

- FlipClock on the right side (compact variant: HH:MM only, no seconds)
- Timezone badge with "Change" button → TimezoneSelector popover
- "New Meeting" button with gradient background on the left

**Step 3: Build dashboard layout**

```tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex">
      <Sidebar user={session.user} />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

**Step 4: Build MeetingCard**

Glass card with:
- Title (bold), status badge, duration badge
- Creator name, participant count
- Time displayed via `<LocalTime>` component
- Location pill if present
- Hover lift animation
- Click → navigate to `/meetings/[id]`

**Step 5: Build dashboard page**

Three sections with headings:
1. "Upcoming Meetings" — confirmed meetings sorted by date
2. "Pending Responses" — meetings user is invited to but hasn't responded
3. "Your Meetings" — meetings user created, with response count badges

Each section: stagger-animated list of MeetingCards. Empty state with subtle message.

Server component fetching data via Prisma in `Promise.all()`.

**Step 6: Commit**

```bash
git add src/app/\(dashboard\)/ src/components/dashboard/ src/components/meetings/MeetingCard.tsx
git commit -m "feat: add dashboard with sidebar, top bar with clock, and meeting cards"
```

---

## Phase 6: Meeting Creation

### Task 11: Create Meeting form

**Files:**
- Create: `src/app/(dashboard)/meetings/new/page.tsx`
- Create: `src/components/meetings/CreateMeetingForm.tsx`
- Create: `src/components/meetings/TimeSlotPicker.tsx`
- Create: `src/app/api/meetings/route.ts`

**Step 1: Build TimeSlotPicker**

Client component:
- Date range selection (start date → end date)
- Time grid: rows = 30-min increments from 8:00 AM to 10:00 PM (in user's timezone), columns = days
- Drag-to-select cells to propose time slots
- Selected cells highlighted with primary gradient
- All times converted to UTC on export via `localToUTC()`
- Visual: glass card containing the grid, each cell is a small rectangle

**Step 2: Build CreateMeetingForm**

Multi-step form (state-managed, no page navigation):

**Step 1/3 — Meeting Details:**
- Title (required)
- Description (optional textarea)
- Location (optional)
- Duration dropdown: 15, 30, 45, 60, 90, 120 min
- Glass card container, Framer Motion slide transition between steps

**Step 2/3 — Time Selection:**
- Toggle: "Set a specific time" (FIXED) vs "Find the best time" (POLL)
- FIXED: single date picker + time picker (in user's local timezone)
- POLL: date range picker + TimeSlotPicker grid
- All times converted to UTC before submission

**Step 3/3 — Invite People:**
- Email input field with "Add" button
- List of added invitees with remove (X) button, each as a glass pill
- Toggle: "Anyone with the link can respond" (enables share link guest mode — on by default)
- "Create Meeting" submit button with loading state

**Step 3: Build the meetings API route**

Create `src/app/api/meetings/route.ts`:
- POST: validate with `createMeetingSchema`, create Meeting + TimeSlots + Participants in a transaction
- GET: return user's meetings (created + participating) with includes
- See blueprint for full implementation

**Step 4: Test** — create a POLL meeting, verify it appears on dashboard.

**Step 5: Commit**

```bash
git add src/app/\(dashboard\)/meetings/new/ src/components/meetings/CreateMeetingForm.tsx src/components/meetings/TimeSlotPicker.tsx src/app/api/meetings/
git commit -m "feat: add multi-step meeting creation with time slot picker"
```

---

## Phase 7: Universal Share Page + Guest System

### Task 12: Universal share page (`/m/[shareToken]`)

**Files:**
- Create: `src/app/m/[shareToken]/page.tsx`
- Create: `src/app/m/[shareToken]/loading.tsx`
- Create: `src/components/meetings/MeetingShareView.tsx`
- Create: `src/components/meetings/GuestJoinSheet.tsx`
- Create: `src/components/meetings/ParticipantList.tsx`
- Create: `src/actions/guest.ts` (server action)

**Step 1: Create server action for guest join**

Create `src/actions/guest.ts`:

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { guestJoinSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function joinAsGuest(meetingId: string, formData: { name: string; email?: string }) {
  const data = guestJoinSchema.parse(formData);

  // Check for duplicate guest email on this meeting
  if (data.email) {
    const existing = await prisma.participant.findFirst({
      where: { meetingId, guestEmail: data.email },
    });
    if (existing) {
      return { error: "This email has already joined", guestToken: existing.guestToken };
    }
  }

  const participant = await prisma.participant.create({
    data: {
      meetingId,
      guestName: data.name,
      guestEmail: data.email || null,
      isGuest: true,
      timezone: "UTC", // Will be updated when they submit availability
    },
  });

  revalidatePath(`/m/`);
  return { guestToken: participant.guestToken, participantId: participant.id };
}
```

**Step 2: Build GuestJoinSheet**

Client component using shadcn `Sheet` (opens from bottom):
- Glass card interior
- Name field (required)
- Email field (optional, helper text: "Add your email to get notified when the time is confirmed")
- "Join Meeting" button with gradient background
- On submit: calls `joinAsGuest` server action, stores `guestToken` in localStorage
- Framer Motion spring entrance animation

**Step 3: Build ParticipantList**

Horizontal scrollable row of participant badges:
- Each: avatar circle (initials) + name + StatusBadge
- Creator badge: 👑 + indigo filled
- Guest badge: violet outline
- Responded: green outline
- Pending: amber outline
- Hover tooltip showing timezone + response time
- Stagger animation on reveal

**Step 4: Build MeetingShareView**

Client component — the main body of the share page:
- Checks `session?.user` (registered user), `localStorage.candidly_guest_{meetingId}` (returning guest), or shows "Join as Guest" button
- Meeting info header: title, creator, duration, location, description
- FlipClock showing viewer's local time
- ParticipantList
- For POLL mode: AvailabilityGrid (interactive) or Heatmap (read-only depending on role)
- For FIXED mode: proposed time in viewer's timezone + "Available" / "Unavailable" buttons
- Share button: copies link to clipboard with toast notification
- Bottom action bar: "Join as Guest" / "Edit Response" / "Share Link"

**Step 5: Build the page (server component)**

Create `src/app/m/[shareToken]/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MeetingShareView } from "@/components/meetings/MeetingShareView";

export default async function SharePage({ params }: { params: { shareToken: string } }) {
  const meeting = await prisma.meeting.findUnique({
    where: { shareToken: params.shareToken },
    include: {
      creator: { select: { firstName: true, lastName: true } },
      participants: {
        include: { availabilities: true },
        orderBy: { createdAt: "asc" },
      },
      timeSlots: { orderBy: { startTime: "asc" } },
    },
  });

  if (!meeting) notFound();

  return <MeetingShareView meeting={meeting} />;
}
```

**Step 6: Create loading skeleton**

Create `src/app/m/[shareToken]/loading.tsx` with pulsing glass card skeletons.

**Step 7: Test** — create a meeting, copy share token from DB, open `/m/{token}`, verify guest join flow works.

**Step 8: Commit**

```bash
git add src/app/m/ src/components/meetings/MeetingShareView.tsx src/components/meetings/GuestJoinSheet.tsx src/components/meetings/ParticipantList.tsx src/actions/
git commit -m "feat: add universal share page with guest join flow"
```

---

## Phase 8: Availability Grid + Heatmap

### Task 13: AvailabilityGrid (drag-to-paint)

**Files:**
- Create: `src/components/meetings/AvailabilityGrid.tsx`
- Create: `src/actions/availability.ts`

**Step 1: Build AvailabilityGrid**

Client component (loaded via `next/dynamic` with `ssr: false`):

- **Grid structure**: columns = days in range, rows = 30-min time slots (8 AM – 10 PM in user's TZ)
- **Pointer events** for unified mouse + touch: `onPointerDown`, `onPointerMove`, `onPointerUp`
- **Drag modes**: pointer down on unselected → select mode, pointer down on selected → deselect mode
- **Visual**: each cell is a rounded rectangle. Unselected: transparent with subtle border. Selected: primary gradient with pulse animation on select. Dragging: semi-transparent preview
- **Time labels**: Y-axis shows times in user's timezone (from `useTimezone`)
- **Day labels**: X-axis shows day names + dates in user's timezone
- **Keyboard support**: arrow keys to navigate, Space to toggle
- **Submit**: converts all selected slots from local time back to UTC via `localToUTC()`, calls server action
- **Optimistic update**: `useOptimistic` for instant visual feedback

**Step 2: Build submit availability server action**

Create `src/actions/availability.ts`:

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { submitAvailabilitySchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function submitAvailability(
  participantId: string,
  guestToken: string | null,
  data: { timezone: string; availabilities: Array<{ startTime: string; endTime: string; isAvailable: boolean }> }
) {
  const validated = submitAvailabilitySchema.parse(data);

  // Verify access
  const participant = await prisma.participant.findFirst({
    where: participantId
      ? { id: participantId }
      : { guestToken: guestToken ?? undefined },
  });

  if (!participant) throw new Error("Participant not found");

  await prisma.$transaction([
    prisma.availability.deleteMany({ where: { participantId: participant.id } }),
    ...validated.availabilities.map((slot) =>
      prisma.availability.create({
        data: {
          participantId: participant.id,
          userId: participant.userId,
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
          isAvailable: slot.isAvailable,
        },
      })
    ),
    prisma.participant.update({
      where: { id: participant.id },
      data: {
        status: "RESPONDED",
        timezone: validated.timezone,
        respondedAt: new Date(),
      },
    }),
  ]);

  revalidatePath("/m/");
  return { success: true };
}
```

**Step 3: Test** — join a meeting as guest, paint availability slots, submit, verify DB records.

**Step 4: Commit**

```bash
git add src/components/meetings/AvailabilityGrid.tsx src/actions/availability.ts
git commit -m "feat: add drag-to-paint availability grid with pointer events"
```

---

### Task 14: AvailabilityHeatmap

**Files:**
- Create: `src/components/meetings/AvailabilityHeatmap.tsx`

**Step 1: Build AvailabilityHeatmap**

Client component:

- Same grid layout as AvailabilityGrid (columns = days, rows = time slots)
- **Read-only** — no interaction, just visualization
- **Color intensity**: each cell colored based on ratio of available participants:
  - 0/N: `rgba(99, 102, 241, 0.05)` (nearly transparent)
  - Scale linearly to N/N: `rgba(99, 102, 241, 0.9)` (solid indigo)
- **Hover tooltip** (shadcn Tooltip): shows "3/5 available" + list of names available/unavailable
- **Best time highlight**: cells where all participants are available get a pulsing glow border
- **Time labels**: in viewer's timezone (from `useTimezone`)
- **Click to confirm** (creator only): clicking a cell opens a confirmation dialog
- Stagger reveal animation on mount

**Step 2: Test** — create meeting, have 2+ participants respond, verify heatmap shows correct overlap.

**Step 3: Commit**

```bash
git add src/components/meetings/AvailabilityHeatmap.tsx
git commit -m "feat: add availability heatmap with intensity gradient and hover tooltips"
```

---

## Phase 9: Meeting Detail + Confirmation

### Task 15: Meeting detail page (creator view)

**Files:**
- Create: `src/app/(dashboard)/meetings/[id]/page.tsx`
- Create: `src/components/meetings/MeetingDetail.tsx`
- Create: `src/actions/meeting.ts`

**Step 1: Build meeting detail server component**

Fetches meeting + participants + availabilities + time slots in `Promise.all()`.

**Step 2: Build MeetingDetail client component**

Layout:
- Meeting info header (title, status badge, duration, location, description) in a glass card
- FlipClock (compact) in top right
- ParticipantList with full status table view (glass card):
  | Name | Status | Timezone | Response Time |
  With StatusBadges, guest badges, etc.
- AvailabilityHeatmap (for POLL mode)
- Action buttons row:
  - "Confirm Time" (primary gradient) — opens dialog to select from heatmap or custom picker
  - "Send Reminder" (outline) — re-sends to pending participants
  - "Copy Share Link" (outline) — copies `/m/{shareToken}` to clipboard
  - "Download .ics" (outline) — after confirmation only
  - "Cancel Meeting" (danger outline)
  - "Add More People" (outline) — opens email input

**Step 3: Build confirm meeting server action**

```typescript
"use server";

export async function confirmMeeting(meetingId: string, confirmedTime: string) {
  // Verify creator
  // Update meeting: status = CONFIRMED, confirmedTime = new Date(confirmedTime)
  // Send confirmation emails to all participants with email
  // Revalidate paths
}
```

**Step 4: Test** — navigate to meeting detail, verify heatmap renders, confirm a time.

**Step 5: Commit**

```bash
git add src/app/\(dashboard\)/meetings/\[id\]/ src/components/meetings/MeetingDetail.tsx src/actions/meeting.ts
git commit -m "feat: add meeting detail page with participant table and confirmation flow"
```

---

## Phase 10: Email System

### Task 16: Email templates + sending

**Files:**
- Create: `src/lib/email.ts`
- Create: `src/lib/ics.ts`
- Create: `emails/MeetingInvite.tsx`
- Create: `emails/MeetingConfirmed.tsx`

**Step 1: Create email sending utility**

Create `src/lib/email.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[Email] Would send to:", to, "Subject:", subject);
    return;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  });
}
```

**Step 2: Create ICS generator**

Copy the `generateICS` function from the blueprint into `src/lib/ics.ts`.

**Step 3: Create email templates**

Meeting invite: shows meeting title, creator name, proposed time in UTC + 3 common timezones, respond buttons.

Meeting confirmed: shows confirmed time, .ics download link, location.

**Step 4: Wire up email sending to meeting creation and confirmation flows.**

**Step 5: Commit**

```bash
git add src/lib/email.ts src/lib/ics.ts emails/
git commit -m "feat: add email templates for invite and confirmation with ICS export"
```

---

## Phase 11: Settings + Polish

### Task 17: Settings page

**Files:**
- Create: `src/app/(dashboard)/settings/page.tsx`
- Create: `src/components/settings/SettingsForm.tsx`

Settings with glass cards for each section:
- Timezone: current timezone display + TimezoneSelector
- Profile: edit name, email
- Password: change password
- All with server actions for mutations

Commit after implementation.

---

### Task 18: Meetings list page

**Files:**
- Create: `src/app/(dashboard)/meetings/page.tsx`

List all user's meetings (created + participating) with filters (All, Created, Invited) as glass pill tabs. Each meeting as a MeetingCard with stagger animation. Empty state with CTA to create first meeting.

Commit after implementation.

---

### Task 19: Polish pass

- Add `loading.tsx` skeletons for all routes (glass card pulsing placeholders)
- Mobile responsive: sidebar collapses to hamburger menu, grid scrolls horizontally
- Toast notifications via `react-hot-toast` with dark theme
- Error boundaries for each route segment
- Copy share link shows toast "Link copied!"
- DST edge case testing: verify UTC conversions work across March/November boundaries

Commit after each sub-item.

---

## Phase 12: Final Integration

### Task 20: End-to-end flow testing

Manual test sequence:
1. Sign up as User A → verify redirect to dashboard
2. Create a POLL meeting with date range + invitees → verify on dashboard
3. Copy share link → open in incognito
4. Join as Guest (name only) → verify guest token in localStorage
5. Paint availability slots → submit → verify heatmap updates
6. Open in another incognito → join as Guest with email → paint different slots
7. Log in as User A → view meeting detail → verify heatmap shows overlap
8. Confirm best time → verify meeting status changes
9. Verify share page updates to show confirmed time
10. Repeat with FIXED meeting type

---

## Dependency Graph

```
Task 1 (scaffold) → Task 2 (theme) → Task 3 (DB)
Task 3 → Task 4 (timezone utils) → Task 7 (FlipClock + Provider)
Task 3 → Task 5 (auth) → Task 6 (auth pages)
Task 7 + Task 8 (UI components) → Task 9 (landing)
Task 6 + Task 7 + Task 8 → Task 10 (dashboard)
Task 10 → Task 11 (create meeting)
Task 11 → Task 12 (share page + guest)
Task 12 → Task 13 (availability grid)
Task 13 → Task 14 (heatmap)
Task 14 → Task 15 (meeting detail)
Task 15 → Task 16 (email)
Task 10 → Task 17 (settings)
Task 10 → Task 18 (meetings list)
Task 16 + Task 17 + Task 18 → Task 19 (polish)
Task 19 → Task 20 (E2E testing)
```

## Parallelization Opportunities

These task groups can be developed in parallel by separate agents:

- **Agent A**: Tasks 1-4 (scaffold + DB + utils) → Tasks 5-6 (auth)
- **Agent B**: Tasks 7-8 (timezone components + UI components) — after Task 4
- **Agent C**: Task 9 (landing page) — after Tasks 7-8
- **Agent D**: Tasks 10-11 (dashboard + create meeting) — after Tasks 6, 7, 8
- **Agent E**: Tasks 12-14 (share page + grid + heatmap) — after Task 11
- **Agent F**: Task 15-16 (meeting detail + email) — after Task 14
- **Agent G**: Tasks 17-18 (settings + meetings list) — after Task 10

The critical path is: 1 → 2 → 3 → 4 → 7 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 19 → 20
