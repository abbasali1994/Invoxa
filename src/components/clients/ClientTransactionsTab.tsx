import React from "react";
import { format } from "date-fns";
import { Receipt } from "lucide-react";
import { StatusBadge } from "@/components/clients/StatusBadge";

export function ClientTransactionsTab({ client }: { client: any }) {
  if (!client.settlements?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
        <Receipt className="w-12 h-12 mb-4 opacity-20" />
        <p>No settlements recorded yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
          <tr>
            <th className="px-5 py-4 font-medium">Invoice #</th>
            <th className="px-5 py-4 font-medium">Date</th>
            <th className="px-5 py-4 font-medium">Invoiced USD</th>
            <th className="px-5 py-4 font-medium">Net Realized</th>
            <th className="px-5 py-4 font-medium">Settlement Gap</th>
            <th className="px-5 py-4 font-medium text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {client.settlements.map((settlement: any) => {
            const gap = settlement.invoicedUSD - (settlement.receivedUSD || 0);
            const inv = client.invoices?.find((i: any) => i.id === settlement.invoiceId);
            return (
              <tr key={settlement.id} className="hover:bg-neutral-800/30 transition-colors">
                <td className="px-5 py-4 font-medium text-white">{inv?.invoiceNumber || 'Unknown'}</td>
                <td className="px-5 py-4 text-neutral-400">{settlement.settledAt ? format(new Date(settlement.settledAt), 'MMM d, yyyy') : 'Pending'}</td>
                <td className="px-5 py-4 text-neutral-300">${settlement.invoicedUSD?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className="px-5 py-4 text-emerald-400 font-medium">${settlement.netRealized?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}</td>
                <td className="px-5 py-4 text-amber-400">-${gap > 0 ? gap.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</td>
                <td className="px-5 py-4 text-right"><StatusBadge status={settlement.status} /></td>
              </tr>
            )
          })}
        </tbody>
        <tfoot className="bg-neutral-950/50 border-t border-neutral-800 font-medium text-white">
          <tr>
            <td colSpan={2} className="px-5 py-4 text-right text-neutral-400">Summary:</td>
            <td className="px-5 py-4">${client.settlements.reduce((s:number, x:any)=>s+(x.invoicedUSD||0),0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td className="px-5 py-4 text-emerald-400">${client.settlements.reduce((s:number, x:any)=>s+(x.netRealized||0),0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td className="px-5 py-4 text-amber-400">-${client.settlements.reduce((s:number, x:any)=>s+(x.invoicedUSD - (x.receivedUSD||0)),0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
