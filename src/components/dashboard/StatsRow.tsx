import React from 'react';
import { Activity, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";

export interface StatsRowProps {
  stats: any;
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Invoiced (USD)"
        value={`$${stats?.invoicedCurrentMonthUSD?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}`}
        subtitle="Current Month"
        subtitleColor="text-emerald-400"
        icon={<DollarSign className="h-4 w-4" />}
      />
      <StatCard
        title="Realized Revenue (INR)"
        value={`₹${stats?.realizedINR?.toLocaleString() || "0"}`}
        subtitle="Total historically"
        icon={<CreditCard className="h-4 w-4" />}
      />
      <StatCard
        title="Pending Settlements"
        value={`${stats?.pendingSettlementsCount || 0} Invoices`}
        subtitle={`Est value: $${stats?.pendingSettlementsUSD?.toLocaleString() || "0"}`}
        icon={<Activity className="h-4 w-4" />}
      />
      <StatCard
        title="Outstanding"
        value={`$${stats?.outstandingReceivablesUSD?.toLocaleString() || "0.00"}`}
        subtitle="Overdue receivables"
        trend="down"
        subtitleColor="text-rose-500/70"
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </div>
  );
}
