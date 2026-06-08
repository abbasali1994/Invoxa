import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultDateRange, type DateRange } from "@/components/ui/DateRangePicker";

export function useSettlements() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [stats, setStats] = useState({
    invoicedCurrentMonthUSD: 0,
    realizedINR: 0,
    pendingSettlementsCount: 0,
    pendingSettlementsUSD: 0,
    outstandingReceivablesUSD: 0,
    totalSettlementGap: 0,
    totalInvoicedUSD: 0,
  });
  const [settlements, setSettlements] = useState<any[]>([]);

  useEffect(() => {
    const { from, to } = dateRange;
    fetch(`/api/dashboard/stats?from=${from}&to=${to}`)
      .then(res => res.json())
      .then(data => setStats({
        invoicedCurrentMonthUSD: data.totalInvoicedUSD || 0,
        realizedINR: data.totalRealizedINR || 0,
        pendingSettlementsCount: data.pendingSettlements?.count || 0,
        pendingSettlementsUSD: data.pendingSettlements?.usdValue || 0,
        outstandingReceivablesUSD: data.outstandingReceivables || 0,
        totalSettlementGap: data.totalSettlementGap || 0,
        totalInvoicedUSD: data.totalInvoicedUSD || 0,
      }))
      .catch(() => {});
    fetch(`/api/settlements?from=${from}&to=${to}`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setSettlements(data);
    }).catch(() => {});
  }, [dateRange]);

  return { router, stats, settlements, dateRange, setDateRange };
}
