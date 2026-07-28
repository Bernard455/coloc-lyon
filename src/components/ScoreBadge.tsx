"use client";

import { useState } from "react";
import type { ScoreBreakdown } from "@/types/listing";

function scoreColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-brand-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

export function ScoreBadge({ score, breakdown }: { score: number; breakdown: ScoreBreakdown | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-full ${scoreColor(score)} px-3 py-1 text-xs font-bold text-white shadow-sm`}
      >
        ⭐ Score : {score}/100
      </button>
      {open && breakdown && (
        <div className="absolute right-0 z-20 mt-2 w-72 animate-fadeIn rounded-xl2 border border-gray-100 bg-white p-4 shadow-cardHover dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-2 text-sm font-semibold">Pourquoi ce score ?</p>
          <ul className="space-y-1.5 text-sm">
            {breakdown.factors.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={f.positive ? "text-emerald-500" : "text-red-500"}>{f.positive ? "✔" : "✘"}</span>
                <span>
                  <span className="font-medium">{f.label}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">{f.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
