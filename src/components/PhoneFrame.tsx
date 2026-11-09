"use client";

import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[402px]">
      <div className="overflow-hidden rounded-[40px] border border-[#d8d6e4] bg-[var(--jb-ink)] p-[11px] shadow-[0_28px_70px_rgba(10,8,63,0.18)]">
        <div className="overflow-hidden rounded-[30px] bg-white">
          <div className="relative flex items-center justify-between bg-white px-5 pb-1.5 pt-3.5 text-[12px] font-semibold text-[var(--jb-ink)]">
            <span>9:41</span>
            <span className="absolute left-1/2 top-2.5 h-[24px] w-[100px] -translate-x-1/2 rounded-full bg-[var(--jb-ink)]" />
            <span className="tracking-tight text-[var(--jb-muted)]">5G</span>
          </div>
          <div className="relative h-[700px] overflow-hidden bg-[var(--jb-bg)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
