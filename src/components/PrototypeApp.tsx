"use client";

import { CompanyApp } from "@/components/company/CompanyApp";
import { LoginScreen } from "@/components/LoginScreen";
import { PhoneFrame } from "@/components/PhoneFrame";
import { WorkerApp } from "@/components/worker/WorkerApp";
import type { DemoAccount } from "@/lib/accounts";
import { useState } from "react";

type Session = {
  account: DemoAccount;
  sessionId: number;
};

export function PrototypeApp() {
  const [session, setSession] = useState<Session | null>(null);

  function signIn(account: DemoAccount) {
    setSession((prev) => ({
      account,
      sessionId: (prev?.sessionId ?? 0) + 1,
    }));
  }

  function signOut() {
    setSession(null);
  }

  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center py-4">
      <PhoneFrame>
        {!session ? (
          <LoginScreen onSignedIn={signIn} />
        ) : session.account.role === "company" ? (
          <CompanyApp
            key={`company-${session.sessionId}`}
            accountName={session.account.displayName}
            accountEmail={session.account.email}
            onSignOut={signOut}
          />
        ) : (
          <WorkerApp
            key={`worker-${session.sessionId}`}
            firstName={session.account.displayName.split(" ")[0] ?? "Worker"}
            lastName={
              session.account.displayName.split(" ").slice(1).join(" ") || ""
            }
            email={session.account.email}
            onSignOut={signOut}
          />
        )}
      </PhoneFrame>
    </div>
  );
}
