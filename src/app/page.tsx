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
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/charts')
        ]);
        
        if (statsRes.ok && chartsRes.ok) {
          setStats(await statsRes.json());
          setCharts(await chartsRes.json());
        } else {
          toast.error("Failed to fetch dashboard data");
        }
      } catch (error) {
        toast.error("Error loading dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Overview" 
        subtitle="Your AI-assisted financial summary." 
      />
      <StatsRow stats={stats} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RevenueChart data={charts?.revenueData || []} />
        <ExpenseBreakdownChart data={charts?.expenseData || []} />
        <CashflowChart data={charts?.forecastData || []} />
      </div>
    </div>
  );
}

