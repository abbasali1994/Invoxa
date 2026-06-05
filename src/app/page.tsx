"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ExpenseBreakdownChart } from "@/components/dashboard/ExpenseBreakdownChart";
import { CashflowChart } from "@/components/dashboard/CashflowChart";

export default function Home() {
  const [statsData, setStatsData] = useState<any>(null);
  const [chartsData, setChartsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [invoicedPeriod, setInvoicedPeriod] = useState<string>('current-fy');
  const [realizedPeriod, setRealizedPeriod] = useState<string>('current-fy');
  const [revenuePeriod, setRevenuePeriod] = useState<string>('12mo');

  useEffect(() => {
    Promise.all([
      fetch(`/api/dashboard/stats?invoicedPeriod=${invoicedPeriod}&realizedPeriod=${realizedPeriod}`).then(r => r.json()),
      fetch(`/api/dashboard/charts?revenuePeriod=${revenuePeriod}`).then(r => r.json()),
    ])
      .then(([stats, charts]) => {
        setStatsData(stats)
        setChartsData(charts)
      })
      .catch(() => setError('Failed to fetch dashboard data'))
      .finally(() => setLoading(false))
  }, [invoicedPeriod, realizedPeriod, revenuePeriod])

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Overview" 
        subtitle="Your AI-assisted financial summary." 
      />
      <StatsRow 
        stats={statsData} 
        invoicedPeriod={invoicedPeriod}
        setInvoicedPeriod={setInvoicedPeriod}
        realizedPeriod={realizedPeriod}
        setRealizedPeriod={setRealizedPeriod}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RevenueChart 
          data={chartsData?.revenueByClient?.months ?? []} 
          clients={chartsData?.revenueByClient?.clients ?? []} 
          revenuePeriod={revenuePeriod}
          setRevenuePeriod={setRevenuePeriod}
        />
        <ExpenseBreakdownChart data={chartsData?.expenseBreakdown ?? []} />
        <CashflowChart data={chartsData?.cashflow ?? []} />
      </div>
    </div>
  );
}
