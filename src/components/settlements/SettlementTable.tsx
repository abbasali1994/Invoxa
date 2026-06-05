import React from "react";
import { Search, Filter, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";

export function SettlementTable({ settlements, router }: { settlements: any[]; router: any }) {
  return (
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
              <th className="px-5 py-3 font-medium text-right">Gap ({"\u20b9"})</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Account</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {settlements.map((s: any) => {
              const displayStatus = s.actualInrReceived ? "SETTLED" : s.status;

              return (
                <tr key={s.id} onClick={() => router.push(`/invoices/${s.invoiceId}`)} className="hover:bg-neutral-800/30 transition-colors cursor-pointer">
                  <td className="px-5 py-4 font-medium">{s.invoice?.invoiceNumber || s.invoiceId}</td>
                  <td className="px-5 py-4 text-neutral-300">{s.invoice?.client?.name || "N/A"}</td>
                  <td className="px-5 py-4 text-right">${s.invoicedUSD}</td>
                  <td className="px-5 py-4 text-right font-medium">{"\u20b9"}{s.actualInrReceived?.toLocaleString("en-IN") || 0}</td>
                  <td className="px-5 py-4 text-right text-neutral-400">{s.exchangeRate}</td>
                  <td className={`px-5 py-4 text-right font-medium ${s.settlementGap > 0 ? "text-rose-400" : (s.settlementGap < 0 ? "text-emerald-400" : "text-neutral-400")}`}>
                    {s.settlementGap > 0 ? "-" : (s.settlementGap < 0 ? "+" : "")}{"\u20b9"}{Math.abs(s.settlementGap || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-4 text-neutral-400">{s.paymentMethod || "N/A"}</td>
                  <td className="px-5 py-4 text-neutral-400">{s.receivingAccount?.name || "N/A"}</td>
                  <td className="px-5 py-4 text-neutral-400">{s.settledAt ? format(new Date(s.settledAt), "MMM d, yyyy") : "N/A"}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      displayStatus === "SETTLED" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {displayStatus}
                    </span>
                  </td>
                </tr>
              );
            })}
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
  );
}
