"use client";
import { Download } from "lucide-react";
import { useSettlements } from "@/hooks/useSettlements";
import { SettlementStats } from "@/components/settlements/SettlementStats";
import { SettlementTable } from "@/components/settlements/SettlementTable";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

export default function SettlementsPage() {
  const { stats, settlements, router, dateRange, setDateRange } = useSettlements();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settlement Intelligence</h2>
          <p className="text-neutral-400">Track cross-border realized payments and FX gaps.</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <button className="flex items-center px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors">
            <Download className="w-4 h-4 mr-2" /> Export
          </button>
        </div>
      </div>
      
      <SettlementStats stats={stats} />
      <SettlementTable settlements={settlements} router={router} />
    </div>
  );
}

