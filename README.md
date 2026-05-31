# TransitFind
## App link: https://transitfind.vercel.app/
### A Centralized Lost & Found Platform for Singapore Public Transport

**Orbital 26 · CP2106 · AY2025/2026 Special Term**

| | |
|---|---|
| **Team Name** | TransitFind |
| **Proposed Level of Achievement** | Apollo |
| **Members** | A0320787X, A0320130H |
| **Adviser** | TBC |
| **Milestone** | 1 — Ideation |

---

## Table of Contents

1. [Motivation](#1-motivation)
2. [Aim](#2-aim)
3. [User Stories](#3-user-stories)
4. [Features](#4-features)
5. [System Design](#5-system-design)
6. [Tech Stack](#6-tech-stack)
7. [Software Engineering Practices](#7-software-engineering-practices)
8. [Technical Proof of Concept](#8-technical-proof-of-concept)
9. [UI Considerations](#9-ui-considerations)
10. [Development Timeline](#10-development-timeline)
11. [Project Log](#11-project-log)

---

## 1. Motivation

Singapore's public transport network is one of the most heavily used in the world. The MRT and bus network together carry over **3 million passenger trips per day**, serving commuters across the entire island. While this system is celebrated for its reliability and efficiency, one area remains persistently inconvenient: **recovering lost items**.

Today, a commuter who loses an item faces a fragmented, confusing process. Singapore's public transport is operated by **four separate providers**:

| Operator | Network Covered |
|---|---|
| SMRT | North-South, East-West, Circle Lines; Bukit Panjang LRT |
| SBS Transit | North-East, Downtown Lines; Sengkang/Punggol LRT; bus services |
| Tower Transit | Bus services in Western Singapore |
| Go-Ahead Singapore | Bus services in Southern Singapore |

Each operator maintains its own lost-and-found portal, phone number, and physical collection office. A commuter who isn't sure which operator runs the bus or MRT line they were on — which is an extremely common situation — must attempt to contact multiple offices before finding the right one.

**This creates a multi-layered problem:**

- Commuters often don't know which operator to contact
- Each operator's portal has a different interface and submission process
- Response times vary wildly across operators
- Items found by passengers have no centralized reporting mechanism
- Workers who find items have no easy way to log them for public visibility

This problem is particularly acute for **vulnerable groups**. Our team's motivation is partly personal: one of our grandmothers has dementia and has lost items on public transport multiple times. For elderly users or those unfamiliar with technology, having to navigate multiple operator websites is an impossibly high barrier.

There is also a **mismatch problem**: someone may have lost a wallet on a bus and reported it to SBS Transit, while a passenger on the same bus found it and reported it to the bus driver who logged it in a physical book — with no digital cross-referencing ever taking place. Recoveries that should happen do not, purely due to system fragmentation.

**TransitFind** is our solution: a single, unified web platform where anyone — commuter, passenger, or transport worker — can report a found or lost item, and where our system intelligently matches reports to maximize recovery rates.

---

## 2. Aim

We aim to build **TransitFind**, a centralized web platform that acts as a one-stop lost-and-found hub for all public transport in Singapore.

Our platform provides a single interface for:

- **Reporting a lost item** — with transport mode, route, location, time, and description
- **Reporting a found item** — by passengers or transport workers
- **Searching and filtering** — across all reports by category, mode, date, location, or keyword
- **Receiving updates** — when the system identifies a potential match (Milestone 3 scope)
- **Contacting the other party** — once a match is identified

### Why now?

No unified platform of this kind currently exists in Singapore. GovTech's OneService app does not cover lost and found for public transport. Each operator's system is siloed. The gap is real, the need is clear, and the technical tools to solve it are available.

---

## 3. User Stories

We identified the following user groups: **commuters** (item losers and finders), **transport workers** (bus captains, station staff), and in future, **administrators**.

| # | As a… | I want to… | So that… |
|---|---|---|---|
| 1 | Commuter who has lost an item | Submit a detailed report with my item description, transport route, and time of loss | Others who found my item can identify and contact me |
| 2 | Commuter who found someone's item | Post a found item report with what I found and where | The rightful owner has a chance of locating it |
| 3 | Commuter | Search for my lost item by filtering on category, transport mode, date, and location | I can quickly find relevant reports without reading everything |
| 4 | Commuter | Create an account and log in securely | My reports are linked to me and I can manage them |
| 5 | Commuter | See a list of all my submitted reports on a dashboard | I can track the status of my items in one place |
| 6 | Commuter | Receive an email notification if a potential match is found for my report | I don't have to keep checking the platform manually |
| 7 | Transport worker | Submit a found item report quickly from any device | I can log items efficiently without accessing multiple systems |
| 8 | Any user | Share the URL of a specific item report | Others can help identify an item or be directed to the right report |

---

## 4. Features

Our features are scoped across three milestones, following **iterative development** principles. Each milestone produces a working, testable system.

### Feature Overview

| # | Feature | Description | Target Milestone | Core / Extension |
|---|---|---|---|---|
| 1 | Lost Item Reporting | Multi-field validated form with controlled React state, enum-constrained inputs, and authenticated API submission | M1 | Core |
| 2 | Browse & Search | Dynamic server-side filtering with programmatic WHERE clause construction and URL-based filter state | M1 | Core |
| 3 | Found Item Reporting | Submit a found item report with parallel data model | M2 | Core |
| 4 | User Dashboard | View and manage your own submitted reports with status tracking | M2 | Core |
| 5 | Heuristic Matching | Weighted multi-attribute scoring algorithm to rank potential matches between lost and found reports | M2 | Core |
| 6 | Email Notifications | Notify users when a potential match is found | M3 | Extension |
| 7 | Admin Dashboard | Moderate reports, close resolved cases | M3 | Extension |


---

### Feature 1 — Lost Item Report Submission

**What it does:** Authenticated users submit a structured report describing their lost item, including category, transport mode, location, and time of loss.

**Technical complexity — this is more than an HTML form:**

The report form is a fully controlled React component with TypeScript-typed state, not a plain HTML form submission. Each field is tracked in a `useState` hook, validated on the client before the request is made, and then validated again on the server before any database write occurs. This multi-layer approach means invalid data is rejected at three distinct points: the React component, the API route, and the Prisma/PostgreSQL layer.

- **Controlled inputs with typed state:** Every field is bound to a typed `useState` variable. Changing any input triggers a re-render of only the affected component, not the whole page — this is React's reactive model in practice.
- **Enum-constrained fields:** `category` and `transportMode` are TypeScript enums that map directly to PostgreSQL enum types via Prisma. The UI renders these as `<select>` elements populated programmatically from the enum values, so it's impossible to submit an invalid category — it's enforced at the component, API, and database levels simultaneously.
- **`datetime-local` → UTC conversion:** The browser's `datetime-local` input returns a locale-sensitive string. The API route parses this into a proper UTC `DateTime` before storing it in PostgreSQL, ensuring consistent time handling regardless of the user's timezone.
- **Authenticated-only endpoint:** The `POST /api/items` route calls `getServerSession` before processing any data. Unauthenticated requests are rejected with HTTP 401. The form is integrated into the session system, not isolated from it.
- **Async feedback with toast notifications:** On submit, the form awaits a `fetch()` call and handles different HTTP status codes differently — displaying targeted error messages (e.g. "Please fill in all required fields" vs. "Something went wrong, please try again") via `react-hot-toast` without a page reload.

**Fields collected:**

- Title, Description (free text)
- Category (enum: WALLET, PHONE, KEYS, BAG, CLOTHING, ELECTRONICS, DOCUMENTS, JEWELLERY, UMBRELLA, OTHER)
- Transport Mode (enum: MRT, BUS, LRT, INTERCHANGE)
- Location / Station / Route (free text)
- Date & Time of Loss (`datetime-local`, stored as UTC)
- Contact Email

---

### Feature 2 — Browse & Search

**What it does:** Users can view all lost item reports and narrow results using keyword search and categorical filters.

**Technical complexity — dynamic query construction and URL-as-state:**

This feature's complexity lies not in displaying data, but in how the query is constructed and how state is managed.

**Programmatic WHERE clause construction:**

Rather than writing a fixed SQL query, the browse API dynamically assembles a Prisma `where` object at runtime based on which filters are active. The structure looks like this conceptually:

```typescript
const where: Prisma.LostItemWhereInput = {
  ...(keyword && {
    OR: [
      { title: { contains: keyword, mode: 'insensitive' } },
      { description: { contains: keyword, mode: 'insensitive' } },
      { location: { contains: keyword, mode: 'insensitive' } },
    ],
  }),
  ...(category && { category: category as ItemCategory }),
  ...(transportMode && { transportMode: transportMode as TransportMode }),
};
```

Each filter is only included if a value is present — inactive filters add no constraint. The keyword search uses an `OR` combinator across three fields simultaneously, so searching "Tampines wallet" can match a title containing "wallet" even if the location field contains "Tampines". This is a deliberate search UX decision: users shouldn't need to know which field their data ended up in.

**URL-as-state (shareable, bookmark-able search results):**

Filter state is encoded in the URL as query parameters, not in React component state. A URL like `/browse?keyword=wallet&category=WALLET&transportMode=MRT` produces the exact same result set for any user. This directly addresses User Story 8 (shareable links) and means:

- No client-side re-fetch is needed on page load — Next.js reads the params server-side and runs the filtered query once
- Results are reproducible and shareable without any session dependency
- The browser back button restores the previous filter state for free

**Conditional rendering of result metadata:**

Results are rendered programmatically from the query output. Transport mode tags are color-coded (MRT, BUS, LRT, INTERCHANGE each have a distinct style) and status badges (OPEN, MATCHED, CLOSED) are rendered conditionally based on the item's status field. This means the component never hard-codes which items appear where — it maps over the data and renders each card from its properties.

---

### Feature 5 — Heuristic Matching System *(Milestone 2)*

**What it does:** When a user views a lost item report, the system surfaces the most likely matching found items, ranked by a computed similarity score.

**Algorithm design:**

This is the DSA centrepiece of TransitFind. The matching system implements a **weighted multi-attribute scoring function** that compares a `LostItem` against every `FoundItem` in the database and produces a score from 0–100 for each pair.

```
matchScore(lostItem, foundItem) → Integer [0, 100]

  Category match (exact):          +40 points
  Transport mode match (exact):    +20 points
  Location token overlap:          up to +20 points
  Time proximity:
    < 2 hours apart:               +20 points
    2–6 hours apart:               +10 points
    6–24 hours apart:              +5 points
    > 24 hours apart:              +0 points

  Total possible: 100
```

**Location token overlap** is computed by tokenizing both location strings (splitting on spaces and punctuation, lowercasing, removing stopwords), then computing the Jaccard similarity of the two token sets: `|intersection| / |union|`. This means "Tampines MRT Station Exit A" and "Tampines Interchange" share the token "tampines" and score partial credit, even though they are not an exact string match.

**Algorithmic steps at query time:**

1. Fetch all `FoundItem` records where `transportMode` matches the `LostItem` (pre-filter to reduce scoring candidates)
2. For each candidate, compute `matchScore(lostItem, foundItem)`
3. Filter out candidates scoring below a threshold (e.g. < 30)
4. Sort descending by score — this is an `O(n log n)` sort over the candidate set
5. Return the top N results to the client

This produces a ranked list rather than a binary match/no-match decision, surfacing the most probable matches first while still showing lower-confidence candidates. The scoring weights are intentionally tunable — category is weighted highest because it is the most discriminating field (a found phone almost certainly isn't a match for a lost wallet), while location overlap is weighted lower because location descriptions are free text and inherently fuzzy.

---

## 5. System Design

### Architecture Overview

TransitFind uses a **monolithic full-stack architecture** suitable for Gemini-level complexity. The frontend and backend are co-located in a single Next.js application.

```
┌─────────────────────────────────────────────────┐
│                   Browser (Client)               │
│         React components, form interactions      │
└────────────────────┬────────────────────────────┘
                     │ HTTP / fetch
┌────────────────────▼────────────────────────────┐
│            Next.js App (Vercel / Local)          │
│                                                  │
│  ┌──────────────┐   ┌──────────────────────────┐│
│  │  App Router  │   │     API Routes           ││
│  │  (RSC + CSC) │   │  /api/register           ││
│  │              │   │  /api/auth/[...nextauth]  ││
│  │  Pages:      │   │  /api/items              ││
│  │  / (landing) │   │  /api/matches            ││
│  │  /login      │   └──────────┬───────────────┘│
│  │  /register   │              │                 │
│  │  /dashboard  │   ┌──────────▼───────────────┐│
│  │  /report-lost│   │        Prisma ORM        ││
│  │  /browse     │   └──────────┬───────────────┘│
│  └──────────────┘              │                 │
│                      ┌──────────▼───────────────┐│
│                      │   PostgreSQL (Supabase)  ││
│                      └──────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### Data Models

```
User
├── id           String (CUID)
├── name         String
├── email        String (unique)
├── password     String (bcrypt hashed)
├── createdAt    DateTime
├── lostReports  LostItem[]
└── foundReports FoundItem[]

LostItem
├── id              String (CUID)
├── title           String
├── description     String
├── category        ItemCategory (enum)
├── transportMode   TransportMode (enum)
├── location        String
├── dateTimeOfLoss  DateTime
├── imageUrl        String? (optional)
├── status          ItemStatus (OPEN | MATCHED | CLOSED)
├── contactEmail    String
├── userId          String (FK → User)
└── createdAt       DateTime

FoundItem (parallel structure to LostItem, for M2)
├── (same fields, dateTimeFound instead of dateTimeOfLoss)
└── userId FK → User

Enums:
  ItemCategory:  WALLET | PHONE | KEYS | BAG | CLOTHING | ELECTRONICS
                 | DOCUMENTS | JEWELLERY | UMBRELLA | OTHER
  TransportMode: MRT | BUS | LRT | INTERCHANGE
  ItemStatus:    OPEN | MATCHED | CLOSED
```

### User Flow

```
New User:
  / (Landing) → /register → POST /api/register → (auto sign-in) → /dashboard

Returning User:
  / → /login → POST /api/auth/[...nextauth] → /dashboard

Report Lost Item:
  /dashboard → /report-lost → POST /api/items → /dashboard (with toast)

Browse Items:
  /browse → GET /api/items?keyword=&category=&transportMode= → filter results

View Matches (M2):
  /item/[id] → GET /api/matches?lostItemId=[id] → ranked found items
```

### File Structure

```
transitfind/
├── prisma/
│   └── schema.prisma              # Database schema and enums
├── src/
│   ├── app/
│   │   ├── (auth)/                # Route group: auth pages (no Navbar)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/           # Route group: protected pages (with Navbar)
│   │   │   ├── layout.tsx         # Auth guard + Navbar wrapper
│   │   │   ├── dashboard/
│   │   │   ├── report-lost/
│   │   │   └── browse/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   │   ├── register/            # Registration endpoint
│   │   │   ├── items/               # Lost items CRUD
│   │   │   └── matches/             # Heuristic matching endpoint (M2)
│   │   ├── layout.tsx             # Root layout (Providers)
│   │   ├── page.tsx               # Landing page
│   │   ├── providers.tsx          # SessionProvider + Toaster
│   │   └── globals.css            # Design tokens and utility classes
│   ├── components/
│   │   └── Navbar.tsx             # Site-wide navigation component
│   ├── lib/
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── prisma.ts              # Prisma singleton (prevents connection pool exhaustion)
│   │   └── matching.ts            # Heuristic scoring logic (M2)
│   └── types/
│       └── next-auth.d.ts         # Session type augmentation
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## 6. Tech Stack

| Technology | Role | Justification |
|---|---|---|
| **Next.js 14** (App Router) | Full-stack framework | Allows frontend + backend in one repo; RSC reduces client bundle; file-based routing is intuitive; Vercel deployment is seamless |
| **React 18** | UI library | Industry standard; component model is a natural fit for a card-based listings UI; RSC support in Next.js 14 |
| **TypeScript** | Type safety | Catches errors at compile time; enum types are shared between API routes and UI components; critical for a multi-model data app |
| **Prisma ORM** | Database interface | Type-safe queries generated from schema; auto-migration; the generated client types align with our TypeScript interfaces throughout the app |
| **PostgreSQL** | Relational database | Relational model suits our data (users → reports, future: matches); ACID compliance for data integrity; native enum support maps cleanly to our ItemCategory and TransportMode enums |
| **Supabase** | Database hosting + Storage | Free tier sufficient for development; provides PostgreSQL + file storage + web dashboard; no devops overhead for a two-person student team |
| **NextAuth.js v4** | Authentication | Production-grade auth for Next.js; credentials provider + JWT sessions; `getServerSession` integrates cleanly with App Router server components |
| **bcryptjs** | Password hashing | Industry standard for password storage; 12 salt rounds provides strong security without excessive compute cost |
| **react-hot-toast** | User feedback | Lightweight toast notifications for async form feedback; no configuration overhead |

---

## 7. Software Engineering Practices

### Version Control — Git

We use **Git** for local version control across all development work. Our branching strategy:

- `main` branch — stable, deployable code only; only merged into at milestone boundaries
- `dev` branch — integration branch for completed features
- Feature branches — named `feature/<name>` (e.g. `feature/auth`, `feature/report-form`, `feature/matching`)

Git gives us the ability to isolate work-in-progress from stable code, revert safely if a change breaks something, and review diffs before merging. We treat commits as a record of intent, not just a backup mechanism.

**Commit message convention:**

```
type(scope): short description

Examples:
feat(auth): add register API route with bcrypt hashing
fix(browse): resolve filter not clearing on empty keyword
refactor(schema): rename dateTimeOfLoss to align with Prisma naming
docs(readme): add system design diagrams for M1
```

### Collaboration — GitHub

We use **GitHub** as our remote repository and collaboration platform. Beyond just hosting the code, GitHub provides:

- **Pull requests** — for Milestone 2 and beyond, all feature branches are merged via PRs with a code review from the other team member before merging to `dev`
- **Issues** — we track bugs and upcoming work as GitHub Issues, linked to their resolving PRs
- **Actions (CI)** — we plan to add a GitHub Actions workflow for Milestone 2 that runs linting (`eslint`) and type-checking (`tsc --noEmit`) on every push to `dev` and `main`, catching errors before they reach the deployed app

### Iterative Development — Agile Methodology

We follow an **agile, milestone-driven** approach rather than trying to design and build the entire system upfront. Each milestone produces a working, end-to-end system that real users could interact with:

- **Milestone 1:** Auth + lost item submission + browse = working prototype
- **Milestone 2:** Found item submission + matching system + dashboard = full core loop
- **Milestone 3:** Notifications + admin + polish = production-ready system

This approach has two practical benefits. First, it forces us to validate that the system actually works end-to-end early, rather than discovering integration problems late. Second, it means we always have something to demo — the Milestone 1 system is functional even without the matching feature that comes later.

We scope each sprint to a concrete deliverable, and we accept that lower-priority features may be deferred, as long as the core loop is working.

### Code Organization

- **Separation of concerns:** API logic lives in `/api` routes, UI lives in page components, shared business logic lives in `/lib`. The matching algorithm, for example, will live in `lib/matching.ts` — completely decoupled from any HTTP handling or UI rendering.
- **Prisma singleton pattern:** `lib/prisma.ts` exports a single shared PrismaClient instance. In Next.js development, hot-reloading would otherwise create a new database connection on every file save, quickly exhausting the PostgreSQL connection pool. The singleton prevents this.
- **Route groups:** `(auth)` and `(dashboard)` separate public and protected pages with their own layouts, without affecting the URL structure.
- **Component-level path comments:** each file includes a comment indicating its path within the project, making it easier to orient yourself when jumping between files.

### Input Validation

We validate data at multiple layers — never trusting that what arrives at the server matches what the form was supposed to send:

- Client-side: controlled inputs prevent obvious bad values; submit is blocked if required fields are empty
- API route: all required fields are checked for presence; type coercion is explicit
- Prisma: enum types reject values not in the defined set; constraint violations throw typed errors
- HTTP responses: 400 for missing/invalid fields, 401 for unauthenticated, 409 for conflicts (e.g. duplicate email), 500 with server-side logging for unexpected errors

---

## 8. Technical Proof of Concept

### What we have built for Milestone 1

#### ✅ User Registration

- `POST /api/register` — creates a new user with a bcrypt-hashed password in PostgreSQL
- Validates presence of all fields, enforces minimum 8-character password, prevents duplicate emails
- Returns 201 on success, appropriate 4xx on failure

#### ✅ User Login

- `POST /api/auth/[...nextauth]` — NextAuth credentials provider validates email + password
- Returns JWT session cookie on success
- Error messages distinguish between "no account found" and "wrong password"

#### ✅ Protected Routes

- `(dashboard)/layout.tsx` calls `getServerSession` server-side on every request
- Unauthenticated requests to `/dashboard`, `/report-lost`, or `/browse` are immediately redirected to `/login`

#### ✅ Lost Item Report Submission

- `POST /api/items` — validates session, validates all required fields, writes to `LostItem` table
- Enum fields validated against TypeScript/Prisma enum types
- `datetime-local` string parsed to UTC before storage
- Returns the created item with 201 status

#### ✅ Browse with Filters

- `GET /api/items?keyword=&category=&transportMode=` — dynamic Prisma WHERE clause built from active params
- Server-rendered results with URL-based filter state (shareable links)
- Keyword matches across title, description, and location simultaneously using OR combinator

#### ✅ Dashboard

- Shows count of user's reports, total lost reports, total found reports
- Lists user's 5 most recent reports with status badges

### Running locally

```bash
# 1. Clone the repo
git clone https://github.com/nichjnrr/transitfind.git
cd transitfind

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# 4. Push schema to database
npx prisma db push

# 5. Generate Prisma client
npx prisma generate

# 6. Start development server
npm run dev

# App is now running at http://localhost:3000
```

### What works end-to-end

1. Visit `http://localhost:3000` → landing page ✅
2. Click "Create Account" → fill in form → account created + auto signed in ✅
3. Redirected to `/dashboard` → stats shown ✅
4. Click "Report a Lost Item" → fill in form → report submitted to PostgreSQL ✅
5. Click "Browse Found Items" → see all reports, filter by keyword/category/mode ✅
6. Sign out → attempting to visit `/dashboard` redirects to login ✅

---

## 9. UI Considerations

### Design Philosophy

TransitFind is designed to be usable by the full range of Singapore's commuter population — from tech-savvy students to elderly commuters who may be unfamiliar with web apps. This directly informs our design decisions, since a platform for lost items is most useful precisely when users are already anxious or frustrated.

### Mobile-First Layout

The majority of lost item reports will happen immediately after the commuter realizes something is missing — while still on the train, at the bus stop, or on the way home. This means most users will be on a phone. TransitFind's layout is designed mobile-first: the form, browse results, and navigation all reflow cleanly for narrow viewports without requiring pinch-to-zoom or horizontal scrolling. The same codebase serves both desktop and mobile through responsive CSS using a design token system defined in `globals.css`.

### Design System and Visual Consistency

Rather than styling each page independently, we use **CSS custom properties (design tokens)** defined in `globals.css` as the single source of truth for colors, spacing, and typography. For example:

```css
:root {
  --color-primary: #0f62fe;
  --color-surface: #ffffff;
  --spacing-md: 1rem;
  --radius-card: 8px;
}
```

This means visual changes (e.g. adjusting the brand color) propagate across the entire app by changing one value, and every component reads from the same token set — guaranteeing consistency without manual coordination across files.

### Color-Coded Transport Mode Tags

On browse result cards, transport mode is displayed as a color-coded tag (e.g. MRT in blue, BUS in green, LRT in amber, INTERCHANGE in purple). This is a deliberate information density decision: a commuter scanning through 20 results can filter by eye far faster when the transport mode is visually distinct rather than reading plain text on every card.

The same principle applies to **status badges** (OPEN in green, MATCHED in orange, CLOSED in grey) — the color communicates status without requiring the user to read the word.

### Shared Navigation via Layout Component

The `Navbar` component is rendered once in `(dashboard)/layout.tsx` and wraps all protected pages. This means the navigation is consistent across every page without any duplication — if we update the Navbar (add a link, change the logo), it updates everywhere simultaneously. Users always know where they are relative to the rest of the app.

### Accessible Form Inputs

Every form input has an associated `<label>` element linked via `htmlFor`/`id`. Enum fields use native `<select>` elements which screen readers handle correctly by default. Required fields are marked with both a visual indicator and the HTML `required` attribute, so both sighted users and assistive technology know what is mandatory before submitting.

### Feedback on Async Actions

Because submitting a report involves a `fetch()` call to the API, there is inherently a delay between the user clicking "Submit" and the confirmation. We handle this explicitly:

- The submit button is disabled while the request is in-flight, preventing duplicate submissions
- A loading state is shown to communicate that something is happening
- On success, a toast notification confirms the submission without navigating away from the form (the user can submit another report immediately if needed)
- On failure, a targeted error message tells the user what went wrong, not just that something failed

---

## 10. Development Timeline

### Sprint Plan

| Period | Sprint Goal | Features |
|---|---|---|
| Week 1 (10–16 May) | Project setup + Liftoff | Repo init, Supabase setup, schema design, poster + video submission |
| Week 2 (17–23 May) | Auth + basic form | User register/login, Lost item form, Browse page (M1 core) |
| Week 3 (24–31 May) | Polish + M1 submission | Testing, README, project log, M1 submission by 1 Jun 2pm |
| Week 4–5 (2–15 Jun) | Found item + Matching | Found item submission, heuristic matching algorithm |
| Week 6–7 (16–28 Jun) | Full dashboard + M2 submission | User dashboard, status management, M2 submission by 29 Jun 2pm |
| Week 8–9 (29 Jun–13 Jul) | Notifications + Admin | Email notifications (SendGrid/Resend), admin moderation panel |
| Week 10–11 (14–26 Jul) | Testing + polish + M3 | User testing, bug fixes, performance, M3 submission by 27 Jul 2pm |
| Week 12–15 (28 Jul–25 Aug) | Final polish + Splashdown | UI refinement, documentation, Splashdown by 26 Aug |

### Milestone 1 Checklist

- [x] Project idea formulated and motivated
- [x] User stories defined (8 stories)
- [x] System design documented (architecture diagram, data models, file structure)
- [x] Tech stack selected with justifications
- [x] Development timeline planned
- [x] Git repository initialised with `.gitignore` and branching strategy
- [x] Supabase project created and `DATABASE_URL` configured
- [x] Prisma schema pushed to PostgreSQL
- [x] User registration endpoint working
- [x] User login (NextAuth) working
- [x] Protected routes working (redirect if unauthenticated)
- [x] Lost item report form + API working end-to-end
- [x] Browse + filter page working
- [x] Dashboard page working
- [x] README (this document) complete
- [x] Project Log updated
- [x] Poster submitted
- [x] Video submitted

---

## 11. Project Log

| Date | Member | Task | Hours |
|---|---|---|---|
| 10 May | Both | Orbital Liftoff session, programme overview | 3 |
| 11 May | Both | Ideation + user story discussion | 2 |
| 12 May | Both | Q&A session attendance | 2 |
| 12 May | A0320787X | Liftoff poster design (Canva) | 3 |
| 12 May | A0320130H | Liftoff video recording and editing | 3 |
| 13 May | Both | Tech stack research (NextAuth vs Clerk, Supabase vs PlanetScale) | 2 |
| 14 May | Both | Supabase project setup + Prisma schema design | 2 |
| 14 May | A0320787X | Poster submission (file naming, Google Drive, Skylab link) | 1 |
| 14 May | A0320130H | Video submission | 1 |
| 15 May | Both | Next.js project init, folder structure, GitHub repo setup | 2 |
| 16 May | A0320787X | Mission Control #1 (Git/GitHub workshop) | 3 |
| 16 May | A0320130H | Mission Control #1 (React workshop) | 3 |
| 17 May | Both | Auth implementation (NextAuth + bcrypt + register API) | 4 |
| 18 May | A0320787X | Lost item report form (client component + API route) | 4 |
| 18 May | A0320130H | Browse page with server-side filters | 4 |
| 19 May | Both | Dashboard page + Navbar component | 3 |
| 20 May | A0320787X | Global CSS design system (tokens, utility classes) | 2 |
| 20 May | A0320130H | Landing page design and implementation | 2 |
| 21 May | Both | Integration testing (end-to-end flow testing) | 3 |
| 22 May | Both | Bug fixes (session type augmentation, enum handling) | 2 |
| 23 May | Both | README writing (this document) | 4 |
| 24 May | Both | M1 review + final polish | 2 |
| **Total** | | | **~57 hrs (both combined, ~28.5 each)** |

> Target by M1 submission (1 Jun): ~35 hours each. Remaining hours will go towards continued feature development, testing, and further documentation before the deadline.

---

*Last updated: May 2026 · TransitFind Team · NUS Orbital 26*
