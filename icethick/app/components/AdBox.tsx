"use client";

import React from "react";

type AdBoxProps = {
  children?: React.ReactNode;
};

export default function AdBox({ children }: AdBoxProps) {
  return (
    <aside className="w-full max-w-sm mx-auto my-6 rounded-xl border border-slate-200 bg-white shadow-sm px-4 py-3 text-center text-xs text-slate-600">
      <div className="mb-1 font-semibold tracking-[0.08em] text-[10px] uppercase text-slate-500">
        Advertisement
      </div>
      <div className="text-[11px] text-slate-500">
        helps keep the site free
      </div>
      {children && (
        <div className="mt-2 text-[11px] text-slate-400">
          {children}
        </div>
      )}
    </aside>
  );
}
