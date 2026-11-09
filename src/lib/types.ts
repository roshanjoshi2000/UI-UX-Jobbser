export type Role = "company" | "worker";

export type SubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

export type PlanId = "free" | "growth" | "scale";

export type Plan = {
  id: PlanId;
  name: string;
  priceMonthly: number;
  activeJobLimit: number | null;
  headline: string;
  features: string[];
  highlighted?: boolean;
};

export type JobPost = {
  id: number;
  companyId: number;
  name: string;
  location: string;
  contract: string;
  active: boolean;
  paidAt: string | null;
  coverage: "plan" | "one_off" | null;
  applicants: number;
};

export type Entitlement = {
  planId: PlanId;
  status: SubscriptionStatus;
  activeJobLimit: number | null;
  activeJobsUsed: number;
  canActivateJob: boolean;
  reason?:
    | "ok"
    | "quota_exceeded"
    | "past_due"
    | "cancelled"
    | "expired"
    | "none_free_exhausted";
  renewsAt?: string;
  cancelAtPeriodEnd?: boolean;
};

export type CompanyScreen =
  | "jobs"
  | "job-detail"
  | "activate-sheet"
  | "quota-sheet"
  | "one-off"
  | "one-off-done"
  | "connections"
  | "messages"
  | "notifications"
  | "account"
  | "plans"
  | "checkout"
  | "billing"
  | "cancel-confirm"
  | "success";

export type WorkerScreen =
  | "search"
  | "job"
  | "applied-done"
  | "applications"
  | "connections"
  | "messages"
  | "notifications"
  | "account";
