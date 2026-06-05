import React from 'react';
import { Activity, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";

export interface StatsRowProps {
  stats: any;
}

export function StatsRow({ stats }: StatsRowProps) {
  const totalInvoicedUSD = stats?.totalInvoicedUSD ?? stats?.invoicedCurrentMonthUSD ?? 0;
  const totalRealizedINR = stats?.totalRealizedINR ?? stats?.realizedINR ?? 0;
  const pendingSettlementsCount = stats?.pendingSettlements?.count ?? stats?.pendingSettlementsCount ?? 0;
  const pendingSettlementsUSD = stats?.pendingSettlements?.usdValue ?? stats?.pendingSettlementsUSD ?? 0;
  const outstandingReceivablesUSD = stats?.outstandingReceivables ?? stats?.outstandingReceivablesUSD ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Invoiced ($)"
        value={`$${totalInvoicedUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subtitle="Current Month"
        subtitleColor="text-emerald-400"
        icon={<DollarSign className="h-4 w-4" />}
      />
      <StatCard
        title="Realized Revenue (\u20b9)"
        value={`\u20b9${totalRealizedINR.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        subtitle="Total historically"
        icon={<CreditCard className="h-4 w-4" />}
      />
      <StatCard
        title="Pending Settlements"
        value={`${pendingSettlementsCount} Invoices`}
        subtitle={`Est value: $${pendingSettlementsUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={<Activity className="h-4 w-4" />}
      />
      <StatCard
        title="Pending Receivables"
        value={`$${outstandingReceivablesUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subtitle="Overdue receivables"
        trend="down"
        subtitleColor="text-rose-500/70"
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </div>
  );
}
