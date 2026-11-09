# Company subscription design

Task 4 — company subscription interface. I spent about 4 hours on the prototype and this write-up.

I built an interactive mobile mock rather than a Figma file so you can click through the real paths. Workers stay free. Brand: primary `#4912ff`, ink `#0a083f`.

## Summary

Companies can:

1. Discover plans
2. Subscribe through a Stripe Checkout style handoff
3. Manage or end the plan
4. Hit a live-slot limit and either upgrade or pay €29 once for a single listing

The UI fakes Jobbser-Api responses in the client. The worker demo account has no billing screens at all.

## Assumptions

Where the brief was quiet I filled in as follows:

- Keep the live five-tab company shell (Jobs, Connections, Messages, Notifications, Account). Billing sits under Account → Your plan / Plans, with a short plan summary on Jobs — not a sixth tab.
- Starter (free) includes **1** live plan-covered listing so a company can try Publish without a card. Pay-per-job (€29) stays available for anything beyond the plan quota.
- One subscription per company. `invite_links` stays team-join, not seat billing.
- I showed prices in **EUR**; I’d want a quick confirm on GBP vs EUR before anything real ships.
- Prototype state is in-memory. In production the success screen would poll subscription status after Stripe until it lands on `active`.
- Workers are never billed. The API should `403` worker tokens on billing routes; the UI simply never links there.

## Platform fit

| Current platform | This design |
|---|---|
| MAUI client → ALB → **Jobbser-Api** | Billing and activate calls target Jobbser-Api shapes |
| Jobbser-Api starts Stripe Checkout for job listings | Subscribe and one-off listing reuse that pattern. Stripe secrets stay in Secrets Manager |
| Checkout sets `job_posts.paid` + `job_posts.active` | Plan-covered Publish sets those flags without Checkout. One-off Publish still uses Checkout |
| **JobbserMsgHub** refreshes jobs, messages, connections | After activate or webhook success, Api notifies MsgHub. UI also polls subscription status |
| **RDS MySQL** for companies, workers, job_posts, applications, connections, messages | Plan and subscription tables are new. Live listing truth stays on `job_posts` |
| Workers free | No billing routes accept a worker token |

```
Client
  → ALB → Jobbser-Api → Stripe Checkout (subscribe / one-off)
                      → RDS MySQL
                      → Secrets Manager
                      → JobbserMsgHub
Stripe webhooks → Jobbser-Api (idempotent on event.id)
```

## Product decisions

| Decision | Why |
|---|---|
| Starter includes 1 live `job_posts` row | Lets companies try the product without removing pay-per-job |
| Paid plans include live slots; extras can still be one-off | Fits existing `paid` / `active` flags |
| Billing under Account → Your plan, with a plan summary on Jobs | Keeps billing with account tools, no new tab |
| Bottom nav: Jobs, Connections, Messages, Notifications, Account | Matches the live Jobbser company shell |
| Checkout hosted by Stripe in production | Same as today's pay-per-job flow |
| Currency shown as EUR | Confirm GBP vs EUR before launch |
| One subscription per company | `invite_links` stays team-join, not seat billing |

## Questions I’d ask in a kickoff

1. Where does today’s pay-per-job entry sit in the live company shell — same Publish path, or a separate paywall?
2. Inside included plan slots, does the subscription fully replace Checkout, or do we still set `paid` the same way for analytics?
3. Is v1 one plan per company, or are seats on the roadmap soon enough that I should leave room?
4. When a plan downgrades or expires mid-period, do live jobs stay up until period end, get unpublished, or need one-off coverage?
5. Should workers ever see a “boosted / paid listing” cue, or is monetisation company-only?
6. EUR vs GBP, and what cancel-at-period-end copy legal wants on the End plan screen.

## Information architecture

```
Company
├── Jobs          Live Jobs / My Jobs / Applicants + plan chip + Publish
├── Connections
├── Messages
├── Notifications
└── Account
    ├── Your plan
    ├── Plans
    ├── Company profile
    └── Help & Q&A

Worker
├── Search / Connections / Messages / Notifications / Account
└── no Plans, Checkout, or billing screens
```

Publish:

Jobs → listing → Publish →
- if entitled → confirm (no Checkout)
- else → upgrade plans, or pay €29 for this job

## Flows in the prototype

| Flow | Path |
|---|---|
| Discover plans | Account → Plans, or Jobs → Manage → Switch plan |
| Subscribe | Growth or Scale → pay → success |
| End plan | Account → Your plan → End this plan |
| Slot full | Publish a draft while Starter already has one live job |
| One-off | Pay €29 for this job → listing goes live, plan unchanged |
| Leave checkout | Back to plans |
| Worker apply | Search → job → Send application |

## API contracts

Company bearer token required. Worker tokens get `403` on billing routes.

### `GET /v1/billing/plans`

```json
{
  "plans": [
    {
      "id": "free",
      "name": "Starter",
      "price_monthly": 0,
      "currency": "eur",
      "active_job_limit": 1,
      "features": ["1 job live on the map"]
    },
    {
      "id": "growth",
      "name": "Growth",
      "price_monthly": 79,
      "currency": "eur",
      "active_job_limit": 5,
      "features": []
    },
    {
      "id": "scale",
      "name": "Scale",
      "price_monthly": 199,
      "currency": "eur",
      "active_job_limit": null,
      "features": []
    }
  ]
}
```

### `GET /v1/companies/{company_id}/subscription`

```json
{
  "company_id": 42,
  "plan_id": "growth",
  "status": "active",
  "cancel_at_period_end": false,
  "current_period_end": "2026-12-06T00:00:00Z",
  "stripe_customer_id": "cus_...",
  "stripe_subscription_id": "sub_..."
}
```

Statuses: `none | trialing | active | past_due | cancelled | expired`.

### `POST /v1/companies/{company_id}/subscription`

```json
{
  "plan_id": "growth",
  "success_url": "jobbser://billing/success",
  "cancel_url": "jobbser://billing/plans"
}
```

```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "session_id": "cs_test_..."
}
```

### `POST /v1/companies/{company_id}/subscription/cancel`

```json
{ "at_period_end": true }
```

### `GET /v1/companies/{company_id}/entitlements`

```json
{
  "plan_id": "free",
  "status": "none",
  "active_job_limit": 1,
  "active_jobs_used": 1,
  "can_activate_job": false,
  "reason": "none_free_exhausted"
}
```

`active_jobs_used` counts plan-covered live `job_posts` for that company.

### `POST /v1/job-posts/{job_id}/activate`

If entitled: set `active=true` and `paid`, notify MsgHub.  
If not:

```json
{
  "error": "entitlement_denied",
  "reason": "quota_exceeded",
  "actions": ["upgrade_plan", "pay_per_job"]
}
```

### `POST /v1/job-posts/{job_id}/activate-one-off`

Stripe Checkout for €29. On success: set `active` and `paid`, mark one-off coverage, notify MsgHub.

### Webhook

`POST /v1/stripe/webhooks` is idempotent on `event.id`. The success screen polls subscription status until `active`.

## Schema mapping

| Existing | Design |
|---|---|
| `companies` | Subscription owner |
| `job_posts.name`, `contract`, `active`, `paid` | Listing fields and live flags |
| `addresses` | City / place for a listing |
| `applications` | Applicant counts and worker apply |
| `connections` | Connections tab |
| `message_threads` / `messages` | Messages |
| `vouchers` | Optional promo path beside plans |
| `invite_links` | Team join, not seat billing |
| `workers` | Free; no billing |
| `jobs` | Hire ledger only, not listings |

## Accessibility

- Primary actions at least 44px tall
- Focus-visible outlines
- Status uses text chips, not colour alone
- Loading uses `role="status"`
- Back controls on stacked flows

## Testing approach

I used the live Jobbser app to check where Account and Jobs sit, then exercised this prototype at phone width (the in-app frame).

| Case | What I check |
|---|---|
| Discover → subscribe → success | Company: Account → Plans → Growth → pay → success; Jobs plan chip updates |
| Cancel mid-flow | Start checkout, hit Back — still on Starter, nothing charged, entitlements unchanged |
| Quota hit | Publish a second draft on Starter → quota sheet → Plans or €29 one-off |
| Manage / end plan | Account → Your plan → End this plan — period-end copy shows |
| Worker never paywalled | Worker account: no Plans / Checkout / Your plan; apply only |
| Empty / loading | Empty segments show empty copy; activate and checkout use a spinner with `role="status"` |

`npm run capture` replays the main company and worker paths into screenshots while the dev server is up.

### Edges I’d still want before production

1. Offline Publish should error and not flip `active`
2. `past_due` / `expired` should block Publish with a billing CTA — the reason codes are in `entitlements.ts`, but the demo starts from a healthy Starter account
3. One-off listings should stay live after a plan ends (`coverage: "one_off"` in the UI; backend would own the rule)
4. Worker tokens `403` on billing; Stripe webhooks idempotent on `event.id`; UI entitlement checks stay aligned with `GET .../entitlements`

## What I’d do next

- Point the screens at real Jobbser-Api + Stripe Checkout
- Add plan / subscription tables in RDS
- Lock EUR vs GBP and End plan legal copy
- Match motion more closely to the live MAUI shell
