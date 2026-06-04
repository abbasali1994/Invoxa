import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useSettlements() {
  const router = useRouter();
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
    fetch('/api/dashboard/stats').then(res => res.json()).then(setStats).catch(()=>{});
    
    fetch('/api/settlements').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setSettlements(data);
    }).catch(()=>{});
  }, []);

  return { router, stats, settlements };
}
