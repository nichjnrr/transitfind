# TransitFind — Setup & GitHub Guide
### Step-by-step instructions for getting the project live

---

## PHASE 1: First-time Setup (Do once, together)

### Step 1 — Install prerequisites

Make sure you both have these installed:
- **Node.js 20+** → https://nodejs.org (download LTS)
- **Git** → https://git-scm.com/downloads
- **VS Code** → https://code.visualstudio.com
- VS Code extensions: ESLint, Prettier, Prisma

Verify installs:
```bash
node --version    # should show v20.x.x
git --version     # should show git version 2.x.x
npm --version     # should show 10.x.x
```

---

### Step 2 — Set up Supabase (database hosting)

1. Go to https://supabase.com and sign up with GitHub
2. Click **New Project**
   - Name: `transitfind`
   - Database password: create a strong one, **save it somewhere**
   - Region: Southeast Asia (Singapore)
3. Wait for the project to provision (~2 min)
4. Go to **Settings → Database → Connection String → URI**
5. Copy the URI — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```
6. Save this as your `DATABASE_URL`

---

### Step 3 — Create GitHub repository

**Person A does this:**

1. Go to https://github.com and sign in
2. Click **+** → **New repository**
3. Name: `transitfind`
4. Visibility: **Private** (can make public at Splashdown)
5. Do NOT check "Add a README" (we already have one)
6. Click **Create repository**
7. Go to Settings → Collaborators → Add partner's GitHub username

**Person B accepts the invite** from their GitHub email.

---

### Step 4 — Set up the project locally

**Both teammates do this:**

```bash
# Clone the repo (get URL from GitHub → green "Code" button)
git clone https://github.com/YOUR_USERNAME/transitfind.git
cd transitfind

# Install dependencies
npm install

# Set up environment file
cp .env.example .env
```

Open `.env` and fill in:
```
DATABASE_URL="postgresql://postgres:YOURPASSWORD@db.xxxx.supabase.co:5432/postgres"
NEXTAUTH_SECRET="run-this-in-terminal: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

To generate `NEXTAUTH_SECRET`:
```bash
# Mac/Linux:
openssl rand -base64 32

# Windows (PowerShell):
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

### Step 5 — Push schema to database

```bash
# Generate Prisma client from schema
npx prisma generate

# Push schema to Supabase PostgreSQL (creates all tables)
npx prisma db push
```

You should see:
```
✔ Generated Prisma Client (v5.x.x)
✔ Your database is now in sync with your Prisma schema.
```

Verify in Supabase: go to **Table Editor** — you should see `User`, `LostItem`, `FoundItem` tables.

---

### Step 6 — Run the development server

```bash
npm run dev
```

Open http://localhost:3000 — you should see the TransitFind landing page.

Test the full flow:
1. Click "Create Account" → register with your email
2. You should be redirected to `/dashboard`
3. Click "Report a Lost Item" → fill in the form
4. Go to "Browse Found Items" — your report should appear

---

## PHASE 2: Daily GitHub Workflow

This is what you do every time you work on the project.

### Before you start coding

```bash
# Always pull latest changes first
git checkout dev
git pull origin dev
```

### Creating a feature branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Examples:
git checkout -b feature/found-item-form
git checkout -b feature/email-notifications
git checkout -b feature/admin-dashboard
```

### While coding — commit often

```bash
# See what files you've changed
git status

# Add specific files
git add src/app/api/items/route.ts src/app/(dashboard)/report-lost/page.tsx

# Or add everything
git add .

# Commit with a descriptive message
git commit -m "feat(items): add found item submission API route"
git commit -m "fix(auth): handle empty password field in register"
git commit -m "docs(readme): update project log for week 2"
```

**Commit message format:**
```
type(scope): description

Types: feat | fix | refactor | docs | style | test | chore
```

### Pushing your branch

```bash
git push origin feature/your-feature-name
```

### Creating a Pull Request (for M2+)

1. Go to GitHub → your repo
2. You'll see a banner: "Compare & pull request" — click it
3. Base: `dev` ← Compare: `feature/your-feature-name`
4. Write a title and description of what you built
5. Assign your partner as reviewer
6. Click **Create pull request**

**Partner reviews:**
- Read through the changed files in the "Files changed" tab
- Leave inline comments on anything confusing
- If it looks good: click **Approve**
- If needs changes: click **Request changes** with comments

**Merging:**
```bash
# After PR is approved, merge on GitHub (click "Merge pull request")
# Then locally:
git checkout dev
git pull origin dev
git branch -d feature/your-feature-name  # delete local branch
```

---

## PHASE 3: Supabase Studio (Database Viewer)

You can view and manually edit your database:

**Option A — Supabase dashboard:**
1. Go to https://supabase.com → your project → Table Editor
2. You can view rows, insert test data, run SQL queries

**Option B — Prisma Studio (local):**
```bash
npx prisma studio
```
Opens a local GUI at http://localhost:5555

**Checking your data after a test submission:**
1. Run the app, register + submit a report
2. Open Prisma Studio → click `LostItem`
3. You should see your submitted row

---

## PHASE 4: Deploying to Vercel (for Milestone 1 submission)

The Orbital evaluators need a **live link** to access your app.

### Step 1 — Push everything to GitHub

```bash
git checkout main
git merge dev
git push origin main
```

### Step 2 — Deploy on Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New → Project**
3. Select your `transitfind` repository → click **Import**
4. Framework preset: **Next.js** (auto-detected)
5. **IMPORTANT — Add environment variables:**
   Click "Environment Variables" and add:
   - `DATABASE_URL` → your Supabase URI
   - `NEXTAUTH_SECRET` → your generated secret
   - `NEXTAUTH_URL` → `https://YOUR-VERCEL-URL.vercel.app` (you can update this after first deploy)
6. Click **Deploy**

### Step 3 — Update NEXTAUTH_URL

After deploying, you'll get a URL like `transitfind-abc123.vercel.app`.

1. Go to Vercel → your project → Settings → Environment Variables
2. Update `NEXTAUTH_URL` to `https://transitfind-abc123.vercel.app`
3. Go to Deployments → click "..." → Redeploy

### Step 4 — Test the live link

Open your Vercel URL in an incognito window:
- Register a new account
- Submit a lost item report
- Browse the results

If it works: **save this URL for your Skylab submission.**

---

## PHASE 5: Milestone 1 Skylab Submission Checklist

Submit by **1 June 2pm SGT** on Skylab.

**What to submit as links:**
1. **README** — link to your GitHub README  
   `https://github.com/YOUR_USERNAME/transitfind/blob/main/README.md`

2. **Project Log** — it's in the README (Section 10), or you can use a Google Sheet  
   If using Google Sheet: File → Share → Anyone with link can view

3. **Project Poster** — Google Drive link (the one from Liftoff, update it if needed)  
   Make sure sharing is set to "Anyone with the link"

4. **Project Video** — Google Drive link  
   Same as poster

**For the README link on Skylab:** use the raw GitHub URL or the rendered README URL.

---

## Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### "PrismaClientInitializationError" / can't connect to database
- Check your `.env` file has the correct `DATABASE_URL`
- Make sure you're not using `.env.example` (it has placeholder values)
- Check Supabase is running (project not paused — free tier pauses after 1 week of inactivity)

### "Invalid NEXTAUTH_SECRET"
```bash
openssl rand -base64 32
# Copy the output into your .env NEXTAUTH_SECRET
```

### Vercel deployment fails — "Error: Cannot find module prisma"
- Make sure `prisma` is in `dependencies` not `devDependencies` in `package.json`
- Add `npx prisma generate` to the build command in Vercel settings:
  - Vercel → Settings → General → Build Command: `npx prisma generate && next build`

### Database schema not updating
```bash
npx prisma db push --force-reset  # WARNING: deletes all data
# Or for production-safe:
npx prisma migrate dev --name "description-of-change"
```

---

*TransitFind · Orbital 26 · NUS Computing*
