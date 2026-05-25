# TransitFind
### A Centralized Lost & Found Platform for Singapore Public Transport

**Orbital 26 · CP2106 · AY2025/2026 Special Term**

| | |
|---|---|
| **Team Name** | TransitFind |
| **Proposed Level of Achievement** | Gemini |
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
9. [Development Timeline](#9-development-timeline)
10. [Project Log](#10-project-log)

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
| 1 | User Authentication | Register, login, logout with secure password hashing | M1 | Core |
| 2 | Lost Item Reporting | Submit a lost item report with all relevant fields | M1 | Core |
| 3 | Browse & Search | View all lost item reports with keyword and filter search | M1 | Core |
| 4 | Found Item Reporting | Submit a found item report | M2 | Core |
| 5 | User Dashboard | View and manage your own submitted reports | M2 | Core |
| 6 | Heuristic Matching | Score and surface potential matches between lost and found reports | M2 | Core |
| 7 | Email Notifications | Notify users when a potential match is found | M3 | Extension |
| 8 | Admin Dashboard | Moderate reports, close resolved cases | M3 | Extension |

> **Note on Gemini scope:** Gemini requires 3–5 features of sufficient complexity. Our core three (Auth, Reporting, Browse/Search) each involve non-trivial logic: auth requires password hashing + session management + JWT; reporting involves multi-field validation + database writes; browse involves dynamic query construction with filters.

---

### Feature 1 — User Authentication

**Complexity justification:** Authentication involves multiple distinct technical components working together:
- Credentials-based login using **NextAuth.js** with JWT session strategy
- Password hashing with **bcryptjs** (12 salt rounds) — plain text passwords are never stored
- Server-side session validation on protected routes using `getServerSession`
- Type-safe session with custom NextAuth type declarations
- Redirect flows for unauthenticated users attempting to access protected pages
- Error handling with meaningful messages (wrong password vs. no account vs. server error)

**Implementation:**
- `POST /api/register` — validates input, hashes password, creates user in PostgreSQL via Prisma
- `POST /api/auth/[...nextauth]` — NextAuth credential provider validates login
- Session persisted via JWT cookie
- Protected layout (`(dashboard)/layout.tsx`) redirects unauthenticated users to `/login`

---

### Feature 2 — Lost Item Report Submission

**Complexity justification:** This feature involves a multi-field validated form with:
- 7 required fields with distinct validation rules
- Enum-constrained inputs (category, transport mode) mapped to database enum types
- `datetime-local` input parsed and stored as proper UTC timestamps
- Authenticated-only endpoint — unauthenticated submissions return 401
- Client-side state management with controlled inputs
- Toast notifications for success/error feedback

**Fields collected:**
- Title, Description (free text)
- Category (enum: WALLET, PHONE, KEYS, BAG, CLOTHING, ELECTRONICS, DOCUMENTS, JEWELLERY, UMBRELLA, OTHER)
- Transport Mode (enum: MRT, BUS, LRT, INTERCHANGE)
- Location / Station / Route (free text)
- Date & Time of Loss (datetime-local)
- Contact Email

---

### Feature 3 — Browse & Search

**Complexity justification:** The browse page supports **dynamic server-side filtering** without client-side JavaScript state:
- URL search params are used to pass filter state, making results **shareable via URL** (addresses User Story 8)
- Prisma WHERE clause is conditionally constructed based on active filters
- Full-text search across title, description, and location using `contains` with `insensitive` mode
- Multiple simultaneous filters (keyword + category + transport mode)
- Results display key metadata with conditional styling (transport mode tags, status badges)

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
│  │  / (landing) │   └──────────┬───────────────┘│
│  │  /login      │              │                 │
│  │  /register   │   ┌──────────▼───────────────┐│
│  │  /dashboard  │   │        Prisma ORM        ││
│  │  /report-lost│   └──────────┬───────────────┘│
│  │  /browse     │              │                 │
│  └──────────────┘   ┌──────────▼───────────────┐│
│                      │   PostgreSQL (Supabase)  ││
│                      └──────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### Data Models

```
User
├── id          String (CUID)
├── name        String
├── email       String (unique)
├── password    String (bcrypt hashed)
├── createdAt   DateTime
├── lostReports LostItem[]
└── foundReports FoundItem[]

LostItem
├── id            String (CUID)
├── title         String
├── description   String
├── category      ItemCategory (enum)
├── transportMode TransportMode (enum)
├── location      String
├── dateTimeOfLoss DateTime
├── imageUrl      String? (optional)
├── status        ItemStatus (OPEN | MATCHED | CLOSED)
├── contactEmail  String
├── userId        String (FK → User)
└── createdAt     DateTime

FoundItem (parallel structure to LostItem, for M2)
├── (same fields, dateTimeFound instead of dateTimeOfLoss)
└── userId FK → User

Enums:
  ItemCategory: WALLET | PHONE | KEYS | BAG | CLOTHING | ELECTRONICS | DOCUMENTS | JEWELLERY | UMBRELLA | OTHER
  TransportMode: MRT | BUS | LRT | INTERCHANGE
  ItemStatus: OPEN | MATCHED | CLOSED
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
```

### File Structure

```
transitfind/
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/             # Route group: auth pages (no Navbar)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/        # Route group: protected pages (with Navbar)
│   │   │   ├── layout.tsx      # Auth guard + Navbar wrapper
│   │   │   ├── dashboard/
│   │   │   ├── report-lost/
│   │   │   └── browse/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   │   ├── register/            # Registration endpoint
│   │   │   └── items/               # Lost items CRUD
│   │   ├── layout.tsx          # Root layout (Providers)
│   │   ├── page.tsx            # Landing page
│   │   ├── providers.tsx       # SessionProvider + Toaster
│   │   └── globals.css         # Design tokens and utilities
│   ├── components/
│   │   └── Navbar.tsx          # Site-wide navigation
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   └── prisma.ts           # Prisma singleton
│   └── types/
│       └── next-auth.d.ts      # Session type augmentation
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
| **React 18** | UI library | Industry standard; familiar from coursework; RSC support in Next.js 14 |
| **TypeScript** | Type safety | Catches errors at compile time; critical for a multi-model data app; improves IDE experience |
| **Prisma ORM** | Database interface | Type-safe queries generated from schema; auto-migration; excellent DX vs. raw SQL for a team new to PostgreSQL |
| **PostgreSQL** | Relational database | Relational model suits our data (users → reports, future: matches); ACID compliance for data integrity |
| **Supabase** | Database hosting + Storage | Free tier sufficient for development; provides PostgreSQL + file storage + web dashboard; no devops required |
| **NextAuth.js v4** | Authentication | Production-grade auth for Next.js; credentials provider + JWT sessions; minimal boilerplate |
| **bcryptjs** | Password hashing | Industry standard for password storage; 12 salt rounds provides good security without excessive compute cost |
| **react-hot-toast** | User feedback | Lightweight toast notifications; no configuration overhead |

---

## 7. Software Engineering Practices

### Version Control — Git & GitHub

We use Git and GitHub for all version control. Our workflow:

**Repository structure:**
- `main` branch — stable, deployable code only
- `dev` branch — integration branch for completed features
- Feature branches — named `feature/<name>` (e.g. `feature/auth`, `feature/report-form`)

**Commit message convention:**
```
type(scope): short description

Examples:
feat(auth): add register API route with bcrypt hashing
fix(browse): resolve filter not clearing on empty keyword
refactor(schema): rename dateTimeOfLoss to align with Prisma naming
docs(readme): add system design diagrams for M1
```

**Pull request process (for Milestone 2+ when codebase grows):**
- Feature branch → PR → code review by partner → merge to `dev`
- `dev` → PR → merge to `main` only when milestone is complete

### Iterative Development

We follow an **agile, milestone-driven** approach. Each milestone produces a working end-to-end system that real users could use:

- **Liftoff (Week 1–2):** Poster + video; project scoping; tech stack decision; Supabase setup
- **Milestone 1 (Weeks 1–3):** Auth + lost item submission + browse = working prototype users can interact with
- **Milestone 2 (Weeks 4–7):** Found item submission + matching system + dashboard = full core loop
- **Milestone 3 (Weeks 8–11):** Notifications + admin + polish = production-ready system

This is "like this" not "not like this" (in reference to the Orbital iterative development slide): each milestone is a usable increment, not a disconnected piece.

### Code Organization

- **Separation of concerns:** API logic in `/api` routes, UI in page components, shared logic in `/lib`
- **Prisma singleton pattern:** prevents connection pool exhaustion in development hot-reload cycles
- **Route groups:** `(auth)` and `(dashboard)` separate public and protected pages, each with their own layout, without affecting URL structure
- **Component-level comments:** each file includes a path comment at the top for orientation

### Input Validation

- Server-side validation on all API routes (never trust client input)
- TypeScript ensures type correctness throughout the call chain
- Prisma enum types enforce valid values at the database level
- HTTP 400 for missing fields, 401 for unauthenticated, 409 for conflicts, 500 with logging for unexpected errors

---

## 8. Technical Proof of Concept

### What we have built for Milestone 1

The following constitute our technical proof of concept — a working, integrated frontend + backend system:

#### ✅ User Registration
- `POST /api/register` — creates a new user with a bcrypt-hashed password in PostgreSQL
- Validates presence of all fields, enforces minimum 8-character password, prevents duplicate emails
- Returns 201 on success, appropriate 4xx on failure

#### ✅ User Login
- `POST /api/auth/[...nextauth]` — NextAuth credentials provider validates email + password
- Returns JWT session cookie on success
- Error messages distinguish between "no account found" and "wrong password"

#### ✅ Protected Routes
- `(dashboard)/layout.tsx` calls `getServerSession` server-side
- Unauthenticated requests to any `/dashboard`, `/report-lost`, or `/browse` page are redirected to `/login`

#### ✅ Lost Item Report Submission
- `POST /api/items` — validates session, validates all required fields, writes to `LostItem` table
- Returns the created item with 201 status

#### ✅ Browse with Filters
- `GET /api/items?keyword=&category=&transportMode=` — dynamic Prisma WHERE clause
- Server-rendered results page with URL-based filter state (shareable links)

#### ✅ Dashboard
- Shows count of user's reports, total lost reports, total found reports
- Lists user's 5 most recent reports with status badges

### Running locally

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/transitfind.git
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

## 9. Development Timeline

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

## 10. Project Log

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
