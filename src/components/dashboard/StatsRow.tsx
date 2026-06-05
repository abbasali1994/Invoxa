import React from 'react';
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { type DateRange, formatRangeDisplay, getActiveQuickLabel } from "@/components/ui/DateRangePicker";

export interface StatsRowProps {
  stats: any;
  dateRange: DateRange;
}

export function StatsRow({ stats, dateRange }: StatsRowProps) {
  const totalInvoicedUSD = stats?.totalInvoicedUSD ?? 0;
  const totalRealizedINR = stats?.totalRealizedINR ?? 0;
  const realizedProfitINR = stats?.realizedProfitINR ?? 0;
  const totalExpensesINR = stats?.totalExpensesINR ?? 0;
  const pendingSettlementsCount = stats?.pendingSettlements?.count ?? 0;
  const pendingSettlementsUSD = stats?.pendingSettlements?.usdValue ?? 0;
  const pendingSettlementsINR = stats?.pendingSettlements?.inrValue ?? 0;
  const usdToInrRate = stats?.pendingSettlements?.usdToInrRate ?? 83.5;

  const rangeLabel = getActiveQuickLabel(dateRange) ?? formatRangeDisplay(dateRange.from, dateRange.to);
  const profitIsPositive = realizedProfitINR >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Invoiced ($)"
        value={`$${totalInvoicedUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subtitle={rangeLabel}
        subtitleColor="text-emerald-400"
      />
      <StatCard
        title="Realized Revenue (₹)"
        value={`₹${totalRealizedINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
        subtitle={rangeLabel}
        subtitleColor="text-indigo-400"
      />
      <StatCard
        title="Realized Profit (₹)"
        value={`₹${Math.abs(realizedProfitINR).toLocaleString('en-IN', { maximumFractionDigits: 0 })}${!profitIsPositive ? ' loss' : ''}`}
        subtitle={`Expenses: ₹${totalExpensesINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
        trend={profitIsPositive ? 'up' : 'down'}
        subtitleColor="text-neutral-500"
        icon={profitIsPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      />
      <StatCard
        title="Pending Settlements"
        value={`$${pendingSettlementsUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subtitle={`${pendingSettlementsCount} invoice${pendingSettlementsCount !== 1 ? 's' : ''} · ₹${pendingSettlementsINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (@${usdToInrRate.toFixed(2)})`}
        icon={<Activity className="h-4 w-4" />}
      />
    </div>
  );
}
