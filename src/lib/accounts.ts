import type { Role } from "./types";

export type DemoAccount = {
  role: Role;
  email: string;
  password: string;
  displayName: string;
  subtitle: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "company",
    email: "hire@northside.demo",
    password: "hire1234",
    displayName: "Northside Scaffolding Ltd",
    subtitle: "Company account",
  },
  {
    role: "worker",
    email: "aisha.murphy@demo.worker",
    password: "work1234",
    displayName: "Aisha Murphy",
    subtitle: "Worker account",
  },
];

export function authenticate(
  email: string,
  password: string,
): DemoAccount | null {
  const normalised = email.trim().toLowerCase();
  return (
    DEMO_ACCOUNTS.find(
      (a) =>
        a.email.toLowerCase() === normalised && a.password === password,
    ) ?? null
  );
}
