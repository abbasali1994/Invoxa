import React from "react";
import { Target, DollarSign, TrendingUp } from "lucide-react";

export function ProjectPLPanel({ project, profitabilityScore }: { project: any, profitabilityScore: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-400">Total Budget</h3>
          <Target className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-3xl font-bold">${project.budget.toLocaleString()}</div>
      </div>
      
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-400">Actual Spend</h3>
          <DollarSign className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-3xl font-bold text-rose-400">$12,450</div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-400">Profitability Score</h3>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-3xl font-bold text-emerald-400">{profitabilityScore}%</div>
      </div>
    </div>
  );
}
