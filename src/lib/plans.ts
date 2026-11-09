import type { Plan } from "./types";

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Starter",
    priceMonthly: 0,
    activeJobLimit: 1,
    headline: "Try Jobbser with one live listing",
    features: [
      "1 job live on the map",
      "Message applicants",
      "See who applied",
      "Extra listings €29 each",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    priceMonthly: 79,
    activeJobLimit: 5,
    headline: "For companies hiring every week",
    features: [
      "5 jobs live at once",
      "See who shared each listing",
      "Faster support replies",
      "Extra listings still €29 each",
    ],
    highlighted: true,
  },
  {
    id: "scale",
    name: "Scale",
    priceMonthly: 199,
    activeJobLimit: null,
    headline: "No cap on how many jobs can be live",
    features: [
      "Unlimited jobs live at once",
      "Team invite links",
      "Simple hiring funnel numbers",
      "Help getting set up",
    ],
  },
];

export const ONE_OFF_LISTING_EUR = 29;

export function planById(id: string) {
  return PLANS.find((p) => p.id === id);
}
