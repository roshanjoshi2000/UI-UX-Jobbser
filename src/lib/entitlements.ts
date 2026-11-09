import { planById } from "./plans";
import type { Entitlement, PlanId, SubscriptionStatus } from "./types";

export function computeEntitlement(input: {
  planId: PlanId;
  status: SubscriptionStatus;
  activeJobsUsed: number;
  cancelAtPeriodEnd?: boolean;
  renewsAt?: string;
}): Entitlement {
  const plan = planById(input.planId) ?? planById("free")!;
  const limit = plan.activeJobLimit;
  const withinQuota = limit === null || input.activeJobsUsed < limit;

  let canActivateJob = false;
  let reason: Entitlement["reason"] = "ok";

  if (input.status === "past_due") {
    canActivateJob = false;
    reason = "past_due";
  } else if (input.status === "expired") {
    canActivateJob = false;
    reason = "expired";
  } else if (input.status === "cancelled") {
    if (input.cancelAtPeriodEnd && withinQuota) {
      canActivateJob = true;
      reason = "ok";
    } else if (!withinQuota) {
      canActivateJob = false;
      reason = "quota_exceeded";
    } else {
      canActivateJob = false;
      reason = "cancelled";
    }
  } else if (
    input.status === "active" ||
    input.status === "trialing" ||
    input.status === "none"
  ) {
    if (withinQuota) {
      canActivateJob = true;
      reason = "ok";
    } else {
      canActivateJob = false;
      reason =
        input.status === "none" ? "none_free_exhausted" : "quota_exceeded";
    }
  }

  return {
    planId: plan.id,
    status: input.status === "none" ? "none" : input.status,
    activeJobLimit: limit,
    activeJobsUsed: input.activeJobsUsed,
    canActivateJob,
    reason,
    renewsAt: input.renewsAt,
    cancelAtPeriodEnd: input.cancelAtPeriodEnd,
  };
}
