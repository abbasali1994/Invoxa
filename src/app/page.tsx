"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ExpenseBreakdownChart } from "@/components/dashboard/ExpenseBreakdownChart";
import { CashflowChart } from "@/components/dashboard/CashflowChart";
import { DateRangePicker, defaultDateRange, type DateRange } from "@/components/ui/DateRangePicker";

export default function Home() {
  const [statsData, setStatsData] = useState<any>(null);
  const [chartsData, setChartsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);

  useEffect(() => {
    setLoading(true);
    const { from, to } = dateRange;
    Promise.all([
      fetch(`/api/dashboard/stats?from=${from}&to=${to}`).then(r => r.json()),
      fetch(`/api/dashboard/charts?from=${from}&to=${to}`).then(r => r.json()),
    ])
      .then(([stats, charts]) => {
        setStatsData(stats);
        setChartsData(charts);
      })
      .catch(() => setError("Failed to fetch dashboard data"))
      .finally(() => setLoading(false));
  }, [dateRange]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        subtitle="Your AI-assisted financial summary."
        actions={
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        }
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          <StatsRow stats={statsData} dateRange={dateRange} />
          <div className="grid gap-4 md:grid-cols-2">
            <RevenueChart
              data={chartsData?.revenueByClient?.months ?? []}
              clients={chartsData?.revenueByClient?.clients ?? []}
            />
            <ExpenseBreakdownChart data={chartsData?.expenseBreakdown ?? []} />
          </div>
          <CashflowChart data={chartsData?.cashflow ?? []} />
        </>
      )}
    </div>
  );
}
