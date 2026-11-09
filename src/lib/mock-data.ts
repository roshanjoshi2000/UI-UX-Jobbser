import type { JobPost } from "./types";

export const DEMO_COMPANY = {
  id: 42,
  name: "Northside Scaffolding Ltd",
  email: "hire@northside.demo",
};

export const DEMO_WORKER = {
  id: 7,
  firstName: "Aisha",
  lastName: "Murphy",
  email: "aisha.murphy@demo.worker",
};

export const INITIAL_JOBS: JobPost[] = [
  {
    id: 101,
    companyId: DEMO_COMPANY.id,
    name: "Scaffolders, Docklands site",
    location: "Dublin 1",
    contract: "Contract",
    active: true,
    paidAt: "2026-10-12T09:00:00Z",
    coverage: "plan",
    applicants: 12,
  },
  {
    id: 102,
    companyId: DEMO_COMPANY.id,
    name: "Site labourer, weekend cover",
    location: "Cork",
    contract: "Temporary",
    active: false,
    paidAt: null,
    coverage: null,
    applicants: 0,
  },
  {
    id: 103,
    companyId: DEMO_COMPANY.id,
    name: "Chargehand, fit-out",
    location: "Galway",
    contract: "Full-time",
    active: false,
    paidAt: null,
    coverage: null,
    applicants: 3,
  },
];
