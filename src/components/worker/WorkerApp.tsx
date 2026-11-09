"use client";

import {
  Button,
  Chip,
  ScreenBody,
  ScreenHeader,
  StatePanel,
  SuccessMark,
  Surface,
  TabBar,
} from "@/components/ui";
import type { WorkerScreen } from "@/lib/types";
import {
  Bell,
  MessageSquare,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { useState } from "react";

type NearbyJob = {
  id: number;
  name: string;
  place: string;
  pay: string;
};

const NEARBY: NearbyJob[] = [
  {
    id: 101,
    name: "Scaffolders, Docklands site",
    place: "Dublin 1 · Contract",
    pay: "€22 / hour",
  },
  {
    id: 204,
    name: "Warehouse operative, nights",
    place: "Dublin 12 · Temporary",
    pay: "€16 / hour",
  },
];

export function WorkerApp({
  firstName,
  lastName,
  email,
  onSignOut,
}: {
  firstName: string;
  lastName: string;
  email: string;
  onSignOut: () => void;
}) {
  const [screen, setScreen] = useState<WorkerScreen>("search");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [applied, setApplied] = useState<Record<number, string>>({});
  const [note, setNote] = useState("");

  const selected = NEARBY.find((j) => j.id === selectedId) ?? null;
  const appliedJobs = NEARBY.filter((j) => applied[j.id]);

  function openJob(job: NearbyJob) {
    setSelectedId(job.id);
    setNote("");
    setScreen("job");
  }

  function submitApplication() {
    if (!selected) return;
    setApplied((prev) => ({
      ...prev,
      [selected.id]: note.trim() || "Applied from the map",
    }));
    setScreen("applied-done");
  }

  const tabs = [
    { id: "search", label: "Search", icon: Search },
    { id: "connections", label: "Connections", icon: Users },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account", icon: UserRound },
  ];

  const showTabs = [
    "search",
    "connections",
    "messages",
    "notifications",
    "account",
    "job",
    "applications",
  ].includes(screen);

  const activeTab =
    screen === "job" || screen === "applied-done" || screen === "applications"
      ? screen === "applications"
        ? "account"
        : "search"
      : screen;

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pb-24">
        {screen === "search" ? (
          <>
            <ScreenHeader title="Search" subtitle={`Hi ${firstName}`} />
            <div className="px-4 pb-4">
              <div className="relative h-[260px] overflow-hidden rounded-2xl border border-[var(--jb-border)] bg-[#dfe8ff]">
                <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_1px_1px,#0a083f22_1px,transparent_0)] [background-size:16px_16px]" />
                <div className="absolute left-3 right-3 top-3 flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3b82f6] text-white shadow-sm"
                    aria-label="List view"
                  >
                    ≡
                  </button>
                  <div className="flex h-10 flex-1 items-center rounded-xl border border-[var(--jb-border)] bg-white px-3 text-sm text-[var(--jb-muted)] shadow-sm">
                    Search everything...
                  </div>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--jb-border)] bg-white text-[var(--jb-muted)] shadow-sm"
                    aria-label="Filter"
                  >
                    ▽
                  </button>
                </div>
                <div className="absolute left-[22%] top-[48%] h-3.5 w-3.5 rounded-full bg-[var(--jb-primary)] animate-pin-pulse" />
                <div className="absolute left-[58%] top-[36%] h-3.5 w-3.5 rounded-full bg-[#16a34a] animate-pin-pulse [animation-delay:700ms]" />
                <div className="absolute left-[40%] top-[62%] h-3.5 w-3.5 rounded-full bg-[#3b82f6]" />
                <p className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-[var(--jb-muted)] shadow-sm">
                  {NEARBY.length} live jobs nearby
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {NEARBY.map((job) => (
                  <Surface key={job.id} className="overflow-hidden p-0">
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 p-3.5 text-left"
                      onClick={() => openJob(job)}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#efeaff] text-xs font-bold text-[var(--jb-primary)]">
                        JB
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-[var(--jb-ink)]">
                          {job.name}
                        </span>
                        <span className="mt-1 block text-sm text-[var(--jb-muted)]">
                          {job.place}
                        </span>
                        <span className="mt-2 block text-sm font-semibold text-[var(--jb-ink)]">
                          {job.pay}
                        </span>
                      </span>
                      {applied[job.id] ? <Chip tone="success">Sent</Chip> : null}
                    </button>
                    {!applied[job.id] ? (
                      <div className="border-t border-[var(--jb-border)] px-3.5 py-2.5">
                        <Button
                          type="button"
                          size="sm"
                          className="w-full"
                          onClick={() => openJob(job)}
                        >
                          View job
                        </Button>
                      </div>
                    ) : null}
                  </Surface>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {screen === "job" && selected ? (
          <>
            <ScreenHeader title="Job" onBack={() => setScreen("search")} />
            <div className="space-y-4 px-4 py-4">
              <Surface>
                <h2 className="text-xl font-bold tracking-tight text-[var(--jb-ink)]">
                  {selected.name}
                </h2>
                <p className="mt-1 text-sm text-[var(--jb-muted)]">
                  {selected.place}
                </p>
                <p className="mt-3 text-base font-bold text-[var(--jb-ink)]">
                  {selected.pay}
                </p>
              </Surface>
              {applied[selected.id] ? (
                <p className="rounded-xl bg-[#e8f7f1] px-3.5 py-3 text-sm text-[#067647]">
                  You already applied. Updates show under Account → Applied.
                </p>
              ) : (
                <>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-semibold text-[var(--jb-ink)]">
                      Note for the company
                    </span>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-[var(--jb-border)] bg-white px-3.5 py-2.5 text-sm text-[var(--jb-ink)] outline-none focus:border-[var(--jb-primary)] focus:ring-4 focus:ring-[var(--jb-subtle)]"
                      placeholder="Available from Monday. CSCS ready."
                    />
                  </label>
                  <Button
                    type="button"
                    className="w-full"
                    size="lg"
                    onClick={submitApplication}
                  >
                    Send application
                  </Button>
                </>
              )}
            </div>
          </>
        ) : null}

        {screen === "applied-done" && selected ? (
          <>
            <ScreenHeader title="Sent" showBrand={false} />
            <ScreenBody className="py-10 text-center">
              <SuccessMark />
              <h2 className="text-xl font-bold text-[var(--jb-ink)]">
                {selected.name}
              </h2>
              <p className="text-sm text-[var(--jb-muted)]">
                The company can message you if they want to talk.
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={() => setScreen("applications")}
              >
                See applications
              </Button>
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => setScreen("search")}
              >
                Back to map
              </Button>
            </ScreenBody>
          </>
        ) : null}

        {screen === "applications" ? (
          <>
            <ScreenHeader
              title="Applied"
              onBack={() => setScreen("account")}
            />
            {appliedJobs.length === 0 ? (
              <StatePanel
                title="No applications yet"
                body="Open a job on the map and send one."
                action={
                  <Button type="button" onClick={() => setScreen("search")}>
                    Find jobs
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3 px-4 py-4">
                {appliedJobs.map((job) => (
                  <Surface key={job.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-[var(--jb-ink)]">
                          {job.name}
                        </p>
                        <p className="mt-1 text-sm text-[var(--jb-muted)]">
                          {applied[job.id]}
                        </p>
                      </div>
                      <Chip tone="success">Sent</Chip>
                    </div>
                  </Surface>
                ))}
              </div>
            )}
          </>
        ) : null}

        {screen === "connections" ? (
          <>
            <ScreenHeader title="Connections" />
            <StatePanel
              title="Grow your network"
              body="Connect with companies and workers to unlock more jobs."
            />
          </>
        ) : null}

        {screen === "messages" ? (
          <>
            <ScreenHeader title="Messages" />
            <StatePanel
              title={appliedJobs.length ? "No replies yet" : "No messages"}
              body={
                appliedJobs.length
                  ? "Company replies will show up here."
                  : "Apply to a job first."
              }
            />
          </>
        ) : null}

        {screen === "notifications" ? (
          <>
            <ScreenHeader title="Notifications" />
            <StatePanel
              title="No alerts"
              body="Hiring updates and connection requests land here."
            />
          </>
        ) : null}

        {screen === "account" ? (
          <>
            <ScreenHeader
              title={`${firstName} ${lastName}`.trim()}
              subtitle={email}
            />
            <div className="space-y-2 px-4 py-4">
              {[
                {
                  label: "Applied",
                  go: () => setScreen("applications"),
                },
                { label: "Skills and certificates", go: () => undefined },
                { label: "Work history", go: () => undefined },
                { label: "Share jobs", go: () => undefined },
                { label: "Help", go: () => undefined },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.go}
                  className="flex w-full items-center justify-between rounded-2xl border border-[var(--jb-border)] bg-white px-4 py-3.5 text-left font-semibold text-[var(--jb-ink)] transition active:scale-[0.99]"
                >
                  {item.label}
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
          onChange={(id) => setScreen(id as WorkerScreen)}
        />
      ) : null}
    </div>
  );
}
