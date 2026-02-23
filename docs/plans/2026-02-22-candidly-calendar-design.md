# Candidly Calendar — Design Document

**Date**: 2026-02-22
**Status**: Approved

---

## Overview

Candidly Calendar is a timezone-aware group scheduling app. Users create meetings (fixed time or availability poll), share a single link, and anyone — registered or guest — can respond. A heatmap reveals the best overlapping times.

## Key Design Decisions

1. **Single universal share link** — `/m/[shareToken]` adapts to creator / registered user / guest
2. **Guest mode** — name + optional email, no account needed, localStorage token for edit access
3. **Dark glassmorphic UI** — deep navy background, frosted glass cards, indigo/violet/emerald accents
4. **Animated flip clock** — spring-animated digit transitions, timezone badge with city name
5. **Server Actions over API routes** for mutations — less boilerplate, auto revalidation
6. **Optimistic updates** with `useOptimistic` for instant slot selection feedback
7. **Suspense streaming** — meeting info renders instantly, participant data streams in

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | NextAuth.js (Credentials) |
| Email | Resend |
| Deployment | Vercel + Railway/Supabase |

## Schema Changes (from blueprint)

Add to Participant model:
- `guestToken String? @unique` — localStorage token for guest edit access
- `isGuest Boolean @default(false)` — distinguishes guest from registered participant

Everything else from the original blueprint schema stays as-is.

## Guest Invite Flow

1. Creator shares `candidly.app/m/abc123` via WhatsApp/Slack/email/anywhere
2. Guest opens link → sees meeting info + flip clock in their auto-detected timezone
3. Guest clicks "Join as Guest" → bottom sheet slides up
4. Guest enters name + optional email → server action creates Participant with `isGuest: true`
5. Server returns `guestToken`, stored in localStorage under `candidly_guest_{meetingId}`
6. Guest marks availability on the drag-to-paint grid
7. Returning guests: localStorage token auto-detected → "Welcome back, {name}" + edit mode
8. If email provided: magic edit link emailed, meeting confirmation emailed when finalized

## Design System

### Colors
- Background: `#0B1120`
- Surface: `rgba(255, 255, 255, 0.05)` + `backdrop-blur(20px)`
- Border: `rgba(255, 255, 255, 0.1)`
- Primary: `#6366F1` → `#8B5CF6` gradient (indigo → violet)
- Success: `#10B981` (emerald)
- Warning: `#F59E0B` (amber)
- Danger: `#EF4444`
- Text primary: `#F1F5F9`
- Text secondary: `#94A3B8`

### Typography
- Font: Inter (or Geist)
- All time displays: `font-variant-numeric: tabular-nums`
- Clock digits: 60-80px, font-weight 200
- Timezone labels: 12-14px, uppercase, letter-spacing 0.1em

### Glass Card (reusable)
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 16px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

### Animations (Framer Motion)
- Flip clock digits: `AnimatePresence` slide up, spring stiffness 300, damping 25
- Card hover: translateY(-2px) + shadow increase + border glow
- Slot selection: scale 1 → 1.05 → 1, color transition
- Stagger load: 30ms delay between items
- Bottom sheet: spring slide from bottom
- Colon pulse: opacity 1 → 0.3 → 1 every second

### Badges
- Creator: indigo filled pill
- Confirmed: green dot + pill
- Pending: amber dot + pill
- Guest: violet outline pill
- Responded: emerald outline pill

### Heatmap Gradient
Scale with participant count:
- 0: `rgba(99, 102, 241, 0.05)`
- 25%: `rgba(99, 102, 241, 0.2)`
- 50%: `rgba(99, 102, 241, 0.4)`
- 75%: `rgba(99, 102, 241, 0.6)`
- 100%: `rgba(99, 102, 241, 0.9)`

## Universal Share Page Layout (`/m/[shareToken]`)

```
┌─────────────────────────────────────────┐
│  [Candidly Logo]          [Flip Clock]  │
├─────────────────────────────────────────┤
│  Meeting Title (large, bold)            │
│  Created by {name} · {duration}min      │
│  Location badge · Description           │
│                                         │
│  Participant badges (scrollable row)    │
│                                         │
│  Availability Heatmap / Grid            │
│  (interactive if responding,            │
│   read-only heatmap if viewing)         │
│                                         │
│  [Join as Guest]  [Share Link]          │
│  (or [Edit Response] if returning)      │
└─────────────────────────────────────────┘
```

## Performance Strategy

- `Promise.all()` for parallel server-side data fetching
- `<Suspense>` streaming for participant responses
- `useOptimistic` for instant slot toggle feedback
- `next/dynamic` with `ssr: false` for AvailabilityGrid
- Meeting data: revalidate every 30s
- Participant data: no-cache (always fresh)
- Static shell: edge-cached

## Critical Rules

1. All datetimes stored as UTC in PostgreSQL
2. Conversion to local time happens ONLY on the client via `<LocalTime>` component
3. IANA timezone strings only (never "EST", always "America/New_York")
4. Every displayed time shows timezone abbreviation
5. Token-based access for guests — no auth required
6. 30-minute granularity for availability grid
7. Share link is the single entry point for all participants
