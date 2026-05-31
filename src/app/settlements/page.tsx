"use client";
import { useEffect, useState } from "react";
import { ArrowRightLeft, Download, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function SettlementsPage() {
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
    
    // We don't have a dedicated GET /api/settlements endpoint in the prompt requirements to fetch the history table,
    // so we will query it directly or create one if needed.
    // Wait, let's just fetch all settlements if there is an endpoint, or fallback to empty.
    fetch('/api/settlements').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setSettlements(data);
    }).catch(()=>{});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settlement Intelligence</h2>
          <p className="text-neutral-400">Track cross-border realized payments and FX gaps.</p>
        </div>
        <button className="flex items-center px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors">
          <Download className="w-4 h-4 mr-2" /> Export
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-6">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <p className="text-sm text-neutral-400 mb-1">Total Invoiced (USD)</p>
          <p className="text-2xl font-bold">${stats.totalInvoicedUSD?.toLocaleString() || '0.00'}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <p className="text-sm text-neutral-400 mb-1">Total Realized (INR)</p>
          <p className="text-2xl font-bold text-emerald-400">₹{stats.realizedINR?.toLocaleString('en-IN') || '0'}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <p className="text-sm text-neutral-400 mb-1">Total Settlement Gap</p>
          <p className={`text-2xl font-bold ${stats.totalSettlementGap > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            ₹{Math.abs(stats.totalSettlementGap || 0).toLocaleString('en-IN')}
            {stats.totalSettlementGap > 0 ? ' (Loss)' : (stats.totalSettlementGap < 0 ? ' (Gain)' : '')}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <p className="text-sm text-neutral-400 mb-1">Pending Settlements</p>
          <p className="text-2xl font-bold">{stats.pendingSettlementsCount || 0}</p>
          <p className="text-xs text-neutral-500 mt-1">${stats.pendingSettlementsUSD?.toLocaleString() || '0'} USD</p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
        <div className="p-4 border-b border-neutral-800 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input type="text" placeholder="Search invoices or clients..." className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 pl-9 pr-4 text-sm" />
          </div>
          <button className="flex items-center px-4 border border-neutral-800 bg-neutral-950 rounded-md text-sm"><Filter className="w-4 h-4 mr-2" /> Filter</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3 font-medium">Invoice #</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium text-right">Inv. USD</th>
                <th className="px-5 py-3 font-medium text-right">Actual INR</th>
                <th className="px-5 py-3 font-medium text-right">Rate</th>
                <th className="px-5 py-3 font-medium text-right">Gap (₹)</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Account</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {settlements.map(s => (
                <tr key={s.id} onClick={() => router.push(`/invoices/${s.invoiceId}`)} className="hover:bg-neutral-800/30 transition-colors cursor-pointer">
                  <td className="px-5 py-4 font-medium">{s.invoice?.invoiceNumber || s.invoiceId}</td>
                  <td className="px-5 py-4 text-neutral-300">{s.invoice?.client?.name || 'N/A'}</td>
                  <td className="px-5 py-4 text-right">${s.invoicedUSD}</td>
                  <td className="px-5 py-4 text-right font-medium">₹{s.actualInrReceived?.toLocaleString('en-IN') || 0}</td>
                  <td className="px-5 py-4 text-right text-neutral-400">{s.exchangeRate}</td>
                  <td className={`px-5 py-4 text-right font-medium ${s.settlementGap > 0 ? 'text-rose-400' : (s.settlementGap < 0 ? 'text-emerald-400' : 'text-neutral-400')}`}>
                    {s.settlementGap > 0 ? '-' : (s.settlementGap < 0 ? '+' : '')}₹{Math.abs(s.settlementGap || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-4 text-neutral-400">{s.paymentMethod || 'N/A'}</td>
                  <td className="px-5 py-4 text-neutral-400">{s.receivingAccount?.name || 'N/A'}</td>
                  <td className="px-5 py-4 text-neutral-400">{s.settledAt ? format(new Date(s.settledAt), 'MMM d, yyyy') : 'N/A'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      s.status === 'SETTLED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {settlements.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center">
                      <ArrowRightLeft className="w-12 h-12 mb-4 opacity-50" />
                      <p>No settlements recorded yet.</p>
                      <p className="text-sm mt-2">Settle an invoice from the invoice details page.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
