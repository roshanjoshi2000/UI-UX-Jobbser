# Jobbser company subscriptions

I chose **Task 4** (company subscription UI). Instead of a static Figma board I built a clickable mobile prototype so the flows are easier to judge — discover plans, subscribe, manage or cancel, and the quota / €29 one-off path when a live slot is full. Workers stay free; there is no billing UI on that side.

Brand colours match Jobbser: `#4912ff` and `#0a083f`. Auth and payments are mocked in the client. Design notes, assumptions, API shapes, and how I’d test this are in [DESIGN.md](./DESIGN.md).

I spent about **4 hours** on this, including reading the schema / AWS notes and walking the live app’s navigation so the shell would feel familiar.

## Run

```bash
npm install
npm run dev
```

Opens on port 3848.

## Demo accounts

Tap an account on the sign-in screen, then Sign in.

| Role | Email | Password |
|------|-------|----------|
| Company | `hire@northside.demo` | `hire1234` |
| Worker | `aisha.murphy@demo.worker` | `work1234` |

Walkthrough I used while building:

1. Sign in as the company.
2. Open My Jobs and publish a draft — Starter already has one live job, so the second publish hits the quota sheet.
3. Either pick a monthly plan or pay €29 for that listing.
4. Under Account → Your plan, switch or end the plan.
5. Sign out, sign in as the worker, open a job from Search, apply, then check Account → Applied.

If you want screenshots of those steps: `npm run capture` (dev server needs to be running).

## Repo layout

| Path | Purpose |
|------|---------|
| `src/components/` | Phone shell, company and worker screens |
| `src/lib/` | Plans, entitlements, sample data |
| `DESIGN.md` | Write-up — IA, contracts, testing, open questions |
| `docs/reference/` | DB schema and AWS inventory I used for context |
| `scripts/capture-flows.mjs` | Playwright capture of the main flows |
