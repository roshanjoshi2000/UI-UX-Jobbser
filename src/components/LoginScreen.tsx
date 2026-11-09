"use client";

import { BrandMark, Button, Surface } from "@/components/ui";
import { DEMO_ACCOUNTS, authenticate } from "@/lib/accounts";
import type { DemoAccount } from "@/lib/accounts";
import { BriefcaseBusiness, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";

export function LoginScreen({
  onSignedIn,
}: {
  onSignedIn: (account: DemoAccount) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function fillAccount(account: DemoAccount) {
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const account = authenticate(email, password);
    setLoading(false);
    if (!account) {
      setError("Wrong email or password.");
      return;
    }
    onSignedIn(account);
  }

  return (
    <div className="flex h-full flex-col bg-[var(--jb-bg)]">
      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-6">
        <BrandMark />
        <h1 className="mt-6 text-[32px] font-bold tracking-tight text-[var(--jb-ink)]">
          Sign in
        </h1>
        <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-[var(--jb-muted)]">
          Companies hire. Workers find work. Use a sample account to explore
          both sides.
        </p>

        <div className="mt-7 space-y-2.5">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon =
              account.role === "company" ? BriefcaseBusiness : UserRound;
            const selected = email === account.email;
            return (
              <button
                key={account.email}
                type="button"
                onClick={() => fillAccount(account)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-left transition active:scale-[0.99] ${
                  selected
                    ? "border-[var(--jb-primary)] bg-[var(--jb-subtle)] shadow-[0_0_0_1px_var(--jb-primary)]"
                    : "border-[var(--jb-border)] bg-white"
                }`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${
                    selected
                      ? "bg-[var(--jb-primary)] text-white"
                      : "bg-[var(--jb-ink)] text-white"
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold text-[var(--jb-ink)]">
                    {account.displayName}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[var(--jb-muted)]">
                    {account.subtitle}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <form className="mt-7 space-y-3.5" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[var(--jb-ink)]">
              Email
            </span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-xl border border-[var(--jb-border)] bg-white px-3.5 text-sm text-[var(--jb-ink)] outline-none transition focus:border-[var(--jb-primary)] focus:ring-4 focus:ring-[var(--jb-subtle)]"
              placeholder="you@company.com"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[var(--jb-ink)]">
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-xl border border-[var(--jb-border)] bg-white px-3.5 text-sm text-[var(--jb-ink)] outline-none transition focus:border-[var(--jb-primary)] focus:ring-4 focus:ring-[var(--jb-subtle)]"
              placeholder="Password"
              required
            />
          </label>

          {error ? (
            <p
              className="rounded-xl bg-[#fff7ed] px-3.5 py-2.5 text-sm text-[#9a3412]"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <Button type="submit" className="mt-1 w-full" size="lg" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <Surface className="mt-5 border-dashed bg-[#faf9fc] p-3.5 text-xs leading-relaxed text-[var(--jb-muted)] shadow-none">
          Sample passwords:{" "}
          <span className="font-mono text-[var(--jb-ink)]">hire1234</span>{" "}
          (company),{" "}
          <span className="font-mono text-[var(--jb-ink)]">work1234</span>{" "}
          (worker).
        </Surface>
      </div>
    </div>
  );
}
