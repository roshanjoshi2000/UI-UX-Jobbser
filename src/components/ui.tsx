"use client";

import { cn } from "@/lib/cn";
import { Check, ChevronLeft, type LucideIcon } from "lucide-react";
import Image from "next/image";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Image src="/jobbser-mark.png" alt="" width={22} height={22} />
      <span className="text-[17px] font-bold tracking-tight text-[var(--jb-ink)]">
        Jobbser
      </span>
    </div>
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--jb-primary)] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-12 px-5 text-base",
        variant === "primary" &&
          "bg-[var(--jb-primary)] text-white hover:bg-[var(--jb-primary-hover)]",
        variant === "secondary" &&
          "bg-[var(--jb-ink)] text-white hover:bg-[#16124f]",
        variant === "outline" &&
          "border border-[var(--jb-primary)] bg-white text-[var(--jb-primary)] hover:bg-[var(--jb-subtle)]",
        variant === "ghost" &&
          "bg-transparent text-[var(--jb-muted)] hover:bg-[var(--jb-subtle)] hover:text-[var(--jb-ink)]",
        variant === "danger" && "bg-[#b42318] text-white hover:bg-[#912018]",
        className,
      )}
      {...props}
    />
  );
}

export function Chip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warn" | "brand";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        tone === "neutral" && "bg-[#ececf1] text-[var(--jb-muted)]",
        tone === "success" && "bg-[var(--jb-chip-green)] text-white",
        tone === "warn" && "bg-[#fff7ed] text-[#b45309]",
        tone === "brand" && "bg-[#efeaff] text-[var(--jb-primary)]",
      )}
    >
      {children}
    </span>
  );
}

export function Surface({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const classes = cn(
    "rounded-2xl border border-[var(--jb-border)] bg-white p-4 text-[var(--jb-ink)] shadow-[0_6px_18px_rgba(10,8,63,0.06)]",
    onClick && "transition active:scale-[0.995]",
    className,
  );
  if (onClick) {
    return (
      <button
        type="button"
        className={cn(classes, "w-full text-left")}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
  return <div className={classes}>{children}</div>;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  trailing,
  showBrand = true,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  trailing?: ReactNode;
  showBrand?: boolean;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--jb-border)] bg-white/95 px-4 pb-3 pt-2 backdrop-blur-md">
      {showBrand && !onBack ? (
        <div className="mb-3">
          <BrandMark />
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--jb-primary)] hover:bg-[var(--jb-subtle)]"
            aria-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={2.25} />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[26px] font-bold leading-none tracking-tight text-[var(--jb-ink)]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 truncate text-sm text-[var(--jb-muted)]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </header>
  );
}

export function SegmentedTabs({
  tabs,
  activeId,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-full bg-[#eceaf4] p-1">
      {tabs.map((tab) => {
        const on = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "shrink-0 flex-1 rounded-full px-3 py-2 text-sm font-semibold transition",
              on
                ? "bg-[var(--jb-primary)] text-white shadow-sm"
                : "bg-transparent text-[var(--jb-muted)] hover:text-[var(--jb-ink)]",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function SearchField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-full border border-[var(--jb-border)] bg-white px-4 text-sm text-[var(--jb-muted)]">
      <span className="text-base">⌕</span>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[var(--jb-ink)] outline-none placeholder:text-[#9b98ad]"
      />
    </label>
  );
}

export function StatePanel({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-4 my-8 rounded-2xl border border-[var(--jb-border)] bg-white px-5 py-10 text-center">
      <h2 className="text-base font-bold text-[var(--jb-ink)]">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--jb-muted)]">
        {body}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 px-6 py-20"
      role="status"
      aria-live="polite"
    >
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#e8e6f5] border-t-[var(--jb-primary)]" />
      <p className="text-sm text-[var(--jb-muted)]">{label}</p>
    </div>
  );
}

export function SuccessMark() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f7f1] text-[#067647] animate-check-pop">
      <Check size={28} strokeWidth={2.5} />
    </div>
  );
}

export function ScreenBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("animate-screen-in space-y-4 px-4 py-4", className)}>
      {children}
    </div>
  );
}

export function TabBar({
  tabs,
  activeId,
  onChange,
}: {
  tabs: { id: string; label: string; icon: LucideIcon }[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-20 border-t border-[var(--jb-border)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <ul
        className="grid px-1 pb-1.5 pt-1.5"
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const on = activeId === tab.id;
          return (
            <li key={tab.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-semibold transition",
                  on
                    ? "text-[var(--jb-primary)]"
                    : "text-[var(--jb-muted)] hover:text-[var(--jb-ink)]",
                )}
                onClick={() => onChange(tab.id)}
              >
                <Icon size={20} strokeWidth={on ? 2.4 : 1.8} />
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
