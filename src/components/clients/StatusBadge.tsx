import React from "react";

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    SENT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    OVERDUE: "bg-red-500/10 text-red-400 border-red-500/20",
    DRAFT: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    SETTLED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  const color = colors[status] || "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
  return <span className={`px-2 py-1 text-xs font-medium border rounded-full ${color}`}>{status}</span>;
}
