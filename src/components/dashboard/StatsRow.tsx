import React from 'react';
import { Activity, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";

export interface StatsRowProps {
  stats: any;
  invoicedPeriod: string;
  setInvoicedPeriod: (p: string) => void;
  realizedPeriod: string;
  setRealizedPeriod: (p: string) => void;
}

function generateMonthOptions() {
  const options = [{ value: 'current-fy', label: 'Current FY' }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    options.push({ value, label });
  }
  return options;
}

export function StatsRow({ stats, invoicedPeriod, setInvoicedPeriod, realizedPeriod, setRealizedPeriod }: StatsRowProps) {
  const totalInvoicedUSD = stats?.totalInvoicedUSD ?? stats?.invoicedCurrentMonthUSD ?? 0;
  const totalRealizedINR = stats?.totalRealizedINR ?? stats?.realizedINR ?? 0;
  const pendingSettlementsCount = stats?.pendingSettlements?.count ?? stats?.pendingSettlementsCount ?? 0;
  const pendingSettlementsUSD = stats?.pendingSettlements?.usdValue ?? stats?.pendingSettlementsUSD ?? 0;
  const outstandingReceivablesUSD = stats?.outstandingReceivables ?? stats?.outstandingReceivablesUSD ?? 0;

  const monthOptions = React.useMemo(() => generateMonthOptions(), []);

  const renderSelect = (value: string, onChange: (v: string) => void) => (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-neutral-800 border border-neutral-700 text-xs rounded px-2 py-1 outline-none text-neutral-300 focus:ring-1 focus:ring-indigo-500"
    >
      {monthOptions.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Invoiced ($)"
        value={`$${totalInvoicedUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subtitle={invoicedPeriod === 'current-fy' ? "Current Financial Year" : monthOptions.find(o => o.value === invoicedPeriod)?.label}
        subtitleColor="text-emerald-400"
        action={renderSelect(invoicedPeriod, setInvoicedPeriod)}
      />
      <StatCard
        title="Realized Revenue (\u20b9)"
        value={`\u20b9${totalRealizedINR.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        subtitle={realizedPeriod === 'current-fy' ? "Current Financial Year" : monthOptions.find(o => o.value === realizedPeriod)?.label}
        action={renderSelect(realizedPeriod, setRealizedPeriod)}
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
