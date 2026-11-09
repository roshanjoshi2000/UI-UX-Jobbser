"use client";

import {
  Button,
  Chip,
  ScreenBody,
  ScreenHeader,
  SearchField,
  SegmentedTabs,
  Spinner,
  StatePanel,
  SuccessMark,
  Surface,
  TabBar,
} from "@/components/ui";
import { INITIAL_JOBS } from "@/lib/mock-data";
import { computeEntitlement } from "@/lib/entitlements";
import { ONE_OFF_LISTING_EUR, PLANS, planById } from "@/lib/plans";
import type {
  CompanyScreen,
  JobPost,
  PlanId,
  SubscriptionStatus,
} from "@/lib/types";
import {
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  MessageSquare,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { useState, useTransition } from "react";

type Billing = {
  planId: PlanId;
  status: SubscriptionStatus;
  renewsAt?: string;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function CompanyApp({
  accountName,
  accountEmail,
  onSignOut,
}: {
  accountName: string;
  accountEmail: string;
  onSignOut: () => void;
}) {
  const [screen, setScreen] = useState<CompanyScreen>("jobs");
  const [jobs, setJobs] = useState<JobPost[]>(() =>
    INITIAL_JOBS.map((j) => ({ ...j })),
  );
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [billing, setBilling] = useState<Billing>({
    planId: "free",
    status: "none",
    cancelAtPeriodEnd: false,
  });
  const [checkoutPlanId, setCheckoutPlanId] = useState<PlanId>("growth");
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [jobsTab, setJobsTab] = useState<"live" | "mine" | "applicants">("live");
  const [query, setQuery] = useState("");

  const activeJobsUsed = jobs.filter(
    (j) => j.active && j.coverage !== "one_off",
  ).length;
  const oneOffLive = jobs.filter(
    (j) => j.active && j.coverage === "one_off",
  ).length;
  const entitlement = computeEntitlement({
    planId: billing.planId,
    status: billing.status,
    activeJobsUsed,
    cancelAtPeriodEnd: billing.cancelAtPeriodEnd,
    renewsAt: billing.renewsAt,
  });

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null;
  const currentPlan = planById(billing.planId)!;

  async function withLoading(label: string, fn: () => Promise<void>) {
    setError(null);
    setLoadingLabel(label);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoadingLabel(null);
    }
  }

  function openActivate(job: JobPost) {
    setSelectedJobId(job.id);
    if (job.active) {
      setScreen("job-detail");
      return;
    }
    if (!entitlement.canActivateJob) {
      setScreen("quota-sheet");
      return;
    }
    setScreen("activate-sheet");
  }

  async function confirmActivate() {
    if (!selectedJob) return;
    await withLoading("Checking your plan...", async () => {
      await delay(450);
      const check = computeEntitlement({
        planId: billing.planId,
        status: billing.status,
        activeJobsUsed,
        cancelAtPeriodEnd: billing.cancelAtPeriodEnd,
        renewsAt: billing.renewsAt,
      });
      if (!check.canActivateJob) {
        setScreen("quota-sheet");
        return;
      }
      await delay(350);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedJob.id
            ? {
                ...j,
                active: true,
                paidAt: new Date().toISOString(),
                coverage: "plan",
              }
            : j,
        ),
      );
      setScreen("job-detail");
    });
  }

  async function payForThisListing() {
    if (!selectedJob) return;
    await withLoading("Taking payment...", async () => {
      await delay(800);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === selectedJob.id
            ? {
                ...j,
                active: true,
                paidAt: new Date().toISOString(),
                coverage: "one_off",
              }
            : j,
        ),
      );
      setScreen("one-off-done");
    });
  }

  function startCheckout(planId: PlanId) {
    if (planId === "free") return;
    setCheckoutPlanId(planId);
    setScreen("checkout");
  }

  async function completeCheckout() {
    await withLoading("Taking payment...", async () => {
      await delay(800);
      setBilling({
        planId: checkoutPlanId,
        status: "active",
        renewsAt: "6 Dec 2026",
        cancelAtPeriodEnd: false,
        stripeCustomerId: "cus_demo_northside",
      });
      setScreen("success");
    });
  }

  async function cancelSubscription() {
    await withLoading("Updating your plan...", async () => {
      await delay(600);
      setBilling((b) => ({
        ...b,
        status: "cancelled",
        cancelAtPeriodEnd: true,
      }));
      setScreen("billing");
    });
  }

  const tabs = [
    { id: "jobs", label: "Jobs", icon: Search },
    { id: "connections", label: "Connections", icon: Users },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account", icon: UserRound },
  ];

  const activeTab = [
    "account",
    "plans",
    "billing",
    "checkout",
    "cancel-confirm",
    "success",
  ].includes(screen)
    ? "account"
    : screen === "connections"
      ? "connections"
      : screen === "messages"
        ? "messages"
        : screen === "notifications"
          ? "notifications"
          : "jobs";

  const showTabs = [
    "jobs",
    "connections",
    "messages",
    "notifications",
    "account",
    "job-detail",
  ].includes(screen);

  const liveJobs = jobs.filter((j) => j.active);
  const draftJobs = jobs.filter((j) => !j.active);
  const visibleJobs =
    jobsTab === "live" ? liveJobs : jobsTab === "mine" ? jobs : jobs;
  const filteredJobs = visibleJobs.filter((j) =>
    j.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pb-24">
        {loadingLabel ? <Spinner label={loadingLabel} /> : null}

        {!loadingLabel && error ? (
          <StatePanel
            title="Payment failed"
            body={error}
            action={
              <Button type="button" onClick={() => setError(null)}>
                OK
              </Button>
            }
          />
        ) : null}

        {!loadingLabel && !error && screen === "jobs" ? (
          <>
            <ScreenHeader
              title="Jobs"
              trailing={
                <Button type="button" size="sm" variant="outline">
                  Create a job
                </Button>
              }
            />
            <div className="space-y-3 px-4 pb-4 pt-5">
              <SegmentedTabs
                tabs={[
                  { id: "live", label: "Live Jobs" },
                  { id: "mine", label: "My Jobs" },
                  { id: "applicants", label: "Applicants" },
                ]}
                activeId={jobsTab}
                onChange={(id) =>
                  setJobsTab(id as "live" | "mine" | "applicants")
                }
              />

              <div className="rounded-2xl border border-[var(--jb-border)] bg-white p-3.5 shadow-[0_6px_18px_rgba(10,8,63,0.05)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--jb-primary)]">
                      Your plan
                    </p>
                    <p className="mt-1 text-lg font-bold text-[var(--jb-ink)]">
                      {currentPlan.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--jb-muted)]">
                      {billing.status === "none"
                        ? `${entitlement.activeJobLimit ?? 1} live job included`
                        : billing.cancelAtPeriodEnd
                          ? `Ends ${billing.renewsAt ?? "soon"}`
                          : `Next payment ${billing.renewsAt ?? "soon"}`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setScreen("billing")}
                  >
                    Manage
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--jb-subtle)] px-2.5 py-1 text-[11px] font-semibold text-[var(--jb-primary)]">
                    {entitlement.activeJobsUsed} of{" "}
                    {entitlement.activeJobLimit ?? "∞"} on plan
                  </span>
                  {oneOffLive > 0 ? (
                    <span className="rounded-full bg-[#ececf1] px-2.5 py-1 text-[11px] font-semibold text-[var(--jb-muted)]">
                      {oneOffLive} paid once
                    </span>
                  ) : null}
                </div>
              </div>

              {billing.status === "none" &&
              entitlement.activeJobsUsed >= (entitlement.activeJobLimit ?? 1) ? (
                <p className="rounded-xl bg-[var(--jb-subtle)] px-3.5 py-2.5 text-sm text-[var(--jb-ink)]">
                  Your free live slot is full. Open a draft under My Jobs to
                  publish it.
                </p>
              ) : null}

              <div className="flex items-center justify-between pt-1">
                <p className="text-sm font-semibold text-[var(--jb-ink)]">
                  {jobsTab === "live"
                    ? "Live Jobs"
                    : jobsTab === "mine"
                      ? "My Jobs"
                      : "Applicants"}
                </p>
                <p className="text-sm font-semibold text-[var(--jb-count-green)]">
                  (
                  {jobsTab === "applicants"
                    ? jobs.reduce((n, j) => n + j.applicants, 0)
                    : jobsTab === "live"
                      ? liveJobs.length
                      : jobs.length}
                  ){" "}
                  {jobsTab === "applicants" ? "People" : "Jobs"}
                </p>
              </div>

              <SearchField
                placeholder="Search..."
                value={query}
                onChange={setQuery}
              />

              {jobsTab === "applicants" ? (
                <StatePanel
                  title="Applicants"
                  body="Open a live job to review people who applied."
                />
              ) : filteredJobs.length === 0 ? (
                <StatePanel
                  title={jobsTab === "live" ? "No live jobs" : "No jobs yet"}
                  body={
                    jobsTab === "live"
                      ? "Publish a draft so it shows on the worker map."
                      : "Create a draft, then publish it."
                  }
                />
              ) : (
                filteredJobs.map((job) => (
                  <Surface key={job.id} className="p-0 overflow-hidden">
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 p-3.5 text-left"
                      onClick={() => {
                        setSelectedJobId(job.id);
                        setScreen("job-detail");
                      }}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#efeaff] text-xs font-bold text-[var(--jb-primary)]">
                        NS
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-[var(--jb-ink)]">
                          {job.name}
                        </span>
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          <Chip tone="success">{job.contract}</Chip>
                          <Chip tone="neutral">
                            {job.active
                              ? job.coverage === "one_off"
                                ? "Paid once"
                                : "Live"
                              : "Draft"}
                          </Chip>
                          {job.location ? (
                            <Chip tone="brand">{job.location}</Chip>
                          ) : null}
                        </span>
                        {job.active ? (
                          <span className="mt-2 block text-sm text-[var(--jb-muted)]">
                            {job.applicants} applicants
                          </span>
                        ) : (
                          <span className="mt-2 block text-sm text-[var(--jb-muted)]">
                            Not on the map yet
                          </span>
                        )}
                      </span>
                      <ChevronRight
                        size={18}
                        className="shrink-0 text-[#9b98ad]"
                      />
                    </button>
                    {!job.active ? (
                      <div className="border-t border-[var(--jb-border)] px-3.5 py-2.5">
                        <button
                          type="button"
                          className="text-sm font-semibold text-[var(--jb-primary)]"
                          onClick={() => openActivate(job)}
                        >
                          Publish this job
                        </button>
                      </div>
                    ) : null}
                  </Surface>
                ))
              )}
              {jobsTab === "live" && draftJobs.length > 0 ? (
                <button
                  type="button"
                  className="w-full text-center text-sm font-semibold text-[var(--jb-primary)]"
                  onClick={() => setJobsTab("mine")}
                >
                  See {draftJobs.length} draft
                  {draftJobs.length === 1 ? "" : "s"} in My Jobs
                </button>
              ) : null}
            </div>
          </>
        ) : null}

        {!loadingLabel && !error && screen === "job-detail" && selectedJob ? (
          <>
            <ScreenHeader title="Job" onBack={() => setScreen("jobs")} />
            <div className="space-y-4 px-4 py-4">
              <Surface>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold tracking-tight text-[var(--jb-ink)]">
                    {selectedJob.name}
                  </h2>
                  <Chip tone={selectedJob.active ? "success" : "warn"}>
                    {selectedJob.active
                      ? selectedJob.coverage === "one_off"
                        ? "Paid once"
                        : "Live"
                      : "Draft"}
                  </Chip>
                </div>
                <p className="mt-2 text-sm text-[var(--jb-muted)]">
                  {selectedJob.location} · {selectedJob.contract}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[var(--jb-muted)]">
                  Published jobs show on the worker map. Publishing uses a plan
                  slot when one is free.
                </p>
              </Surface>
              {!selectedJob.active ? (
                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  onClick={() => openActivate(selectedJob)}
                >
                  Publish
                </Button>
              ) : (
                <Button
                  type="button"
                  className="w-full"
                  variant="outline"
                  onClick={() => setScreen("jobs")}
                >
                  Back to jobs
                </Button>
              )}
            </div>
          </>
        ) : null}

        {!loadingLabel &&
        !error &&
        screen === "activate-sheet" &&
        selectedJob ? (
          <>
            <ScreenHeader
              title="Publish"
              onBack={() => setScreen("job-detail")}
            />
            <div className="space-y-4 px-4 py-4">
              <Surface className="border-transparent bg-[var(--jb-subtle)]">
                <p className="text-sm font-semibold text-[var(--jb-ink)]">
                  Included in {currentPlan.name}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--jb-muted)]">
                  {entitlement.activeJobsUsed} of{" "}
                  {entitlement.activeJobLimit ?? "unlimited"} slots in use. No
                  extra charge for this job.
                </p>
              </Surface>
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={() => startTransition(() => void confirmActivate())}
                disabled={pending}
              >
                Publish job
              </Button>
              <Button
                type="button"
                className="w-full"
                variant="ghost"
                onClick={() => setScreen("job-detail")}
              >
                Not now
              </Button>
            </div>
          </>
        ) : null}

        {!loadingLabel && !error && screen === "quota-sheet" ? (
          <>
            <ScreenHeader
              title="Plan is full"
              onBack={() => setScreen(selectedJob ? "job-detail" : "jobs")}
            />
            <ScreenBody>
              <Surface className="border-[#f3d1aa] bg-[#fff7ed]">
                <p className="font-bold text-[#9a3412]">
                  {entitlement.reason === "past_due"
                    ? "We could not take your last payment"
                    : entitlement.reason === "expired"
                      ? "Your plan has ended"
                      : `${currentPlan.name} has no free live slots`}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#9a3412]">
                  {entitlement.reason === "past_due"
                    ? "Update your card to publish more jobs."
                    : selectedJob
                      ? `Upgrade for more included slots, or pay €${ONE_OFF_LISTING_EUR} once to publish this job.`
                      : "Upgrade your plan, or pay once to publish a single listing."}
                </p>
              </Surface>
              {selectedJob ? (
                <Surface className="py-3.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--jb-muted)]">
                    This job
                  </p>
                  <p className="mt-1 font-bold text-[var(--jb-ink)]">
                    {selectedJob.name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--jb-muted)]">
                    {selectedJob.location} · {selectedJob.contract}
                  </p>
                </Surface>
              ) : null}
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={() => setScreen("plans")}
              >
                See monthly plans
              </Button>
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => setScreen("one-off")}
                disabled={!selectedJob}
              >
                Pay €{ONE_OFF_LISTING_EUR} for this job
              </Button>
            </ScreenBody>
          </>
        ) : null}

        {!loadingLabel && !error && screen === "plans" ? (
          <>
            <ScreenHeader
              title="Plans"
              subtitle="Live jobs included each month"
              onBack={() =>
                setScreen(
                  selectedJob && !selectedJob.active ? "quota-sheet" : "account",
                )
              }
            />
            <div className="space-y-3 px-4 py-4">
              {PLANS.map((plan) => {
                const isCurrent =
                  billing.planId === plan.id &&
                  (billing.status === "active" ||
                    (plan.id === "free" && billing.status === "none"));
                return (
                  <Surface
                    key={plan.id}
                    className={
                      plan.highlighted
                        ? "border-[var(--jb-primary)] bg-[var(--jb-subtle)]"
                        : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-[var(--jb-ink)]">
                            {plan.name}
                          </p>
                          {plan.highlighted ? (
                            <Chip tone="brand">Popular</Chip>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-[var(--jb-muted)]">
                          {plan.headline}
                        </p>
                      </div>
                      <p className="text-right">
                        <span className="text-2xl font-bold text-[var(--jb-ink)]">
                          €{plan.priceMonthly}
                        </span>
                        <span className="block text-xs text-[var(--jb-muted)]">
                          / month
                        </span>
                      </p>
                    </div>
                    <ul className="mt-3 space-y-1.5">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-sm text-[var(--jb-muted)]"
                        >
                          <Check
                            size={16}
                            className="mt-0.5 shrink-0 text-[var(--jb-primary)]"
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {plan.id === "free" ? (
                      <Button
                        type="button"
                        className="mt-4 w-full"
                        variant="outline"
                        disabled={isCurrent}
                      >
                        {isCurrent ? "Your plan" : "Included"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        className="mt-4 w-full"
                        variant={plan.highlighted ? "primary" : "secondary"}
                        onClick={() => startCheckout(plan.id)}
                        disabled={isCurrent}
                      >
                        {isCurrent ? "Your plan" : `Choose ${plan.name}`}
                      </Button>
                    )}
                  </Surface>
                );
              })}
            </div>
          </>
        ) : null}

        {!loadingLabel && !error && screen === "checkout" ? (
          <>
            <ScreenHeader
              title={`Choose ${planById(checkoutPlanId)?.name ?? "plan"}`}
              onBack={() => setScreen("plans")}
            />
            <div className="space-y-4 px-4 py-4">
              <Surface>
                <p className="text-sm text-[var(--jb-muted)]">Monthly</p>
                <p className="text-xl font-bold text-[var(--jb-ink)]">
                  {planById(checkoutPlanId)?.name}
                </p>
                <p className="mt-1 text-sm text-[var(--jb-muted)]">
                  €{planById(checkoutPlanId)?.priceMonthly} / month
                </p>
              </Surface>
              <Surface className="space-y-3">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-[var(--jb-ink)]">
                    Card number
                  </span>
                  <input
                    className="h-11 w-full rounded-xl border border-[#e2e0ea] bg-white text-[var(--jb-ink)] px-3"
                    defaultValue="4242 4242 4242 4242"
                    readOnly
                    aria-label="Card number"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-semibold text-[var(--jb-ink)]">
                      Expiry
                    </span>
                    <input
                      className="h-11 w-full rounded-xl border border-[#e2e0ea] bg-white text-[var(--jb-ink)] px-3"
                      defaultValue="12 / 28"
                      readOnly
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-semibold text-[var(--jb-ink)]">
                      CVC
                    </span>
                    <input
                      className="h-11 w-full rounded-xl border border-[#e2e0ea] bg-white text-[var(--jb-ink)] px-3"
                      defaultValue="123"
                      readOnly
                    />
                  </label>
                </div>
              </Surface>
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={() => void completeCheckout()}
              >
                Pay €{planById(checkoutPlanId)?.priceMonthly}
              </Button>
              <Button
                type="button"
                className="w-full"
                variant="ghost"
                onClick={() => setScreen("plans")}
              >
                Back to plans
              </Button>
            </div>
          </>
        ) : null}

        {!loadingLabel && !error && screen === "success" ? (
          <>
            <ScreenHeader title="All set" />
            <ScreenBody className="py-10 text-center">
              <SuccessMark />
              <h2 className="text-xl font-bold text-[var(--jb-ink)]">
                {currentPlan.name} is active
              </h2>
              <p className="text-sm text-[var(--jb-muted)]">
                You can publish more jobs now. Manage the plan from Account.
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={() => setScreen("jobs")}
              >
                Back to jobs
              </Button>
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => setScreen("billing")}
              >
                View plan
              </Button>
            </ScreenBody>
          </>
        ) : null}

        {!loadingLabel && !error && screen === "billing" ? (
          <>
            <ScreenHeader title="Your plan" onBack={() => setScreen("account")} />
            <div className="space-y-4 px-4 py-4">
              <Surface>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[var(--jb-subtle)] p-2.5 text-[var(--jb-primary)]">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--jb-ink)]">
                      {currentPlan.name}
                    </p>
                    <p className="text-sm text-[var(--jb-muted)]">
                      {billing.status === "none"
                        ? "No monthly plan"
                        : billing.cancelAtPeriodEnd
                          ? `Ends ${billing.renewsAt ?? "soon"}`
                          : billing.status === "active"
                            ? "Active"
                            : billing.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[var(--jb-muted)]">On this plan</dt>
                    <dd className="mt-0.5 font-semibold text-[var(--jb-ink)]">
                      {entitlement.activeJobsUsed} of{" "}
                      {entitlement.activeJobLimit ?? "∞"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--jb-muted)]">Next payment</dt>
                    <dd className="mt-0.5 font-semibold text-[var(--jb-ink)]">
                      {billing.renewsAt ?? "soon"}
                    </dd>
                  </div>
                </dl>
                {oneOffLive > 0 ? (
                  <p className="mt-3 text-sm text-[var(--jb-muted)]">
                    {oneOffLive} listing paid separately.
                  </p>
                ) : null}
              </Surface>

              <Button
                type="button"
                className="w-full"
                onClick={() => setScreen("plans")}
              >
                Switch plan
              </Button>
              {billing.status === "active" ||
              (billing.status === "cancelled" && billing.cancelAtPeriodEnd) ? (
                <Button
                  type="button"
                  className="w-full"
                  variant="danger"
                  disabled={!!billing.cancelAtPeriodEnd}
                  onClick={() => setScreen("cancel-confirm")}
                >
                  {billing.cancelAtPeriodEnd
                    ? `Ends ${billing.renewsAt ?? "soon"}`
                    : "End this plan"}
                </Button>
              ) : null}
            </div>
          </>
        ) : null}

        {!loadingLabel && !error && screen === "cancel-confirm" ? (
          <>
            <ScreenHeader
              title="End this plan?"
              onBack={() => setScreen("billing")}
            />
            <div className="space-y-4 px-4 py-4">
              <p className="text-sm leading-relaxed text-[var(--jb-muted)]">
                You keep {currentPlan.name} until{" "}
                {billing.renewsAt ?? "the period ends"}. Then you return to
                Starter with 1 live job. Listings you paid for once stay live.
              </p>
              <Button
                type="button"
                className="w-full"
                variant="danger"
                onClick={() => void cancelSubscription()}
              >
                End on {billing.renewsAt ?? "period end"}
              </Button>
              <Button
                type="button"
                className="w-full"
                variant="ghost"
                onClick={() => setScreen("billing")}
              >
                Keep {currentPlan.name}
              </Button>
            </div>
          </>
        ) : null}

        {!loadingLabel && !error && screen === "one-off" && selectedJob ? (
          <>
            <ScreenHeader
              title="Pay once"
              onBack={() => setScreen("quota-sheet")}
            />
            <div className="space-y-4 px-4 py-4">
              <Surface>
                <p className="text-sm text-[var(--jb-muted)]">This listing</p>
                <p className="mt-1 text-lg font-bold text-[var(--jb-ink)]">
                  {selectedJob.name}
                </p>
                <p className="mt-3 text-3xl font-bold text-[var(--jb-ink)]">
                  €{ONE_OFF_LISTING_EUR}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--jb-muted)]">
                  Your plan stays {currentPlan.name}. This job stays live until
                  you take it down.
                </p>
              </Surface>
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={() => void payForThisListing()}
              >
                Pay €{ONE_OFF_LISTING_EUR}
              </Button>
              <Button
                type="button"
                className="w-full"
                variant="ghost"
                onClick={() => setScreen("quota-sheet")}
              >
                Back
              </Button>
            </div>
          </>
        ) : null}

        {!loadingLabel && !error && screen === "one-off-done" && selectedJob ? (
          <>
            <ScreenHeader title="Published" />
            <ScreenBody className="py-10 text-center">
              <SuccessMark />
              <h2 className="text-xl font-bold text-[var(--jb-ink)]">
                {selectedJob.name}
              </h2>
              <p className="text-sm text-[var(--jb-muted)]">
                Workers nearby can see it. You are still on {currentPlan.name}.
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={() => setScreen("jobs")}
              >
                Back to jobs
              </Button>
            </ScreenBody>
          </>
        ) : null}

        {!loadingLabel && !error && screen === "connections" ? (
          <>
            <ScreenHeader
              title="Connections"
              trailing={
                <Button type="button" size="sm" variant="outline">
                  Invite
                </Button>
              }
            />
            <StatePanel
              title="12 connections"
              body="Invite people you trust, then share jobs with them."
            />
          </>
        ) : null}

        {!loadingLabel && !error && screen === "messages" ? (
          <>
            <ScreenHeader
              title="Messages"
              trailing={
                <Button type="button" size="sm" variant="outline">
                  New Message
                </Button>
              }
            />
            <div className="space-y-3 px-4 pb-4">
              <SegmentedTabs
                tabs={[
                  { id: "new", label: "New" },
                  { id: "all", label: "All" },
                  { id: "read", label: "Read" },
                ]}
                activeId="all"
                onChange={() => undefined}
              />
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--jb-ink)]">All Messages</p>
                <p className="text-sm font-semibold text-[var(--jb-count-green)]">
                  (0) Unread
                </p>
              </div>
              <SearchField placeholder="Search messages" />
              <StatePanel
                title="Inbox"
                body="Chats with applicants land here."
              />
            </div>
          </>
        ) : null}

        {!loadingLabel && !error && screen === "notifications" ? (
          <>
            <ScreenHeader title="Notifications" />
            <StatePanel
              title="You are up to date"
              body="Application and plan alerts will show here."
            />
          </>
        ) : null}

        {!loadingLabel && !error && screen === "account" ? (
          <>
            <ScreenHeader title="Account" subtitle={accountName} />
            <div className="space-y-2 px-4 py-4">
              <p className="px-1 text-xs text-[var(--jb-muted)]">{accountEmail}</p>
              {[
                {
                  label: "Your plan",
                  hint: "Usage, switch, or end",
                  go: () => setScreen("billing"),
                },
                {
                  label: "Plans",
                  hint: "Starter, Growth, Scale",
                  go: () => setScreen("plans"),
                },
                {
                  label: "Company profile",
                  hint: "Name, logo, about, website",
                  go: () => undefined,
                },
                {
                  label: "Help & Q&A",
                  hint: "In-app answers about Jobbser",
                  go: () => undefined,
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.go}
                  className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3.5 text-left text-[var(--jb-ink)] transition active:scale-[0.99]"
                >
                  <span>
                    <span className="block font-semibold">{item.label}</span>
                    <span className="text-sm text-[#5b5770]">{item.hint}</span>
                  </span>
                  <ChevronRight size={16} className="text-[#9b98ad]" />
                </button>
              ))}
              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full"
                onClick={onSignOut}
              >
                Sign out
              </Button>
            </div>
          </>
        ) : null}
      </div>
      {showTabs ? (
        <TabBar
          tabs={tabs}
          activeId={activeTab}
          onChange={(id) => {
            setError(null);
            setScreen(id as CompanyScreen);
          }}
        />
      ) : null}
    </div>
  );
}
