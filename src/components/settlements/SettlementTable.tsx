import React, { useState } from "react";
import { Search, Filter, ArrowRightLeft, ChevronUp, ChevronDown } from "lucide-react";
import { format } from "date-fns";

type SortField = 'client' | 'invoicedUSD' | 'actualINR' | 'rate' | 'gap' | 'date' | null;
type SortDirection = 'asc' | 'desc' | null;

export function SettlementTable({ settlements, router }: { settlements: any[]; router: any }) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (!field) return;
    if (sortField === field) {
      if (field === 'client') {
        if (sortDirection === 'asc') setSortDirection('desc');
        else if (sortDirection === 'desc') { setSortDirection(null); setSortField(null); }
      } else {
        if (sortDirection === 'desc') setSortDirection('asc');
        else if (sortDirection === 'asc') { setSortDirection(null); setSortField(null); }
      }
    } else {
      setSortField(field);
      setSortDirection(field === 'client' ? 'asc' : 'desc');
    }
  };

  const sortedSettlements = [...settlements].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    if (sortField === 'client') {
      const aName = a.invoice?.client?.name || '';
      const bName = b.invoice?.client?.name || '';
      return sortDirection === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
    }

    if (sortField === 'invoicedUSD') {
      const aVal = a.invoicedUSD || 0;
      const bVal = b.invoicedUSD || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    if (sortField === 'actualINR') {
      const aVal = a.actualInrReceived || 0;
      const bVal = b.actualInrReceived || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    if (sortField === 'rate') {
      const aVal = a.exchangeRate || 0;
      const bVal = b.exchangeRate || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    if (sortField === 'gap') {
      const aVal = a.settlementGap || 0;
      const bVal = b.settlementGap || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    if (sortField === 'date') {
      const aDate = a.settledAt ? new Date(a.settledAt).getTime() : 0;
      const bDate = b.settledAt ? new Date(b.settledAt).getTime() : 0;
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    }

    return 0;
  });

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-indigo-400" /> : <ChevronDown className="w-3 h-3 text-indigo-400" />;
  };

  const SortableHeader = ({ field, label, right }: { field: SortField; label: string; right?: boolean }) => (
    <th className={`px-5 py-3 font-medium${right ? ' text-right' : ''}`}>
      <button
        onClick={() => handleSort(field)}
        className={`flex items-center gap-1 group hover:text-neutral-300 transition-colors${right ? ' ml-auto' : ''}`}
      >
        {label} {renderSortIcon(field)}
      </button>
    </th>
  );

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
      <div className="p-4 border-b border-neutral-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input type="text" placeholder="Search invoices or clients..." className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 pl-9 pr-4 text-sm" />
        </div>
        <button className="flex items-center justify-center px-4 py-2 border border-neutral-800 bg-neutral-950 rounded-md text-sm shrink-0"><Filter className="w-4 h-4 mr-2" /> Filter</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
            <tr>
              <th className="px-5 py-3 font-medium">Invoice #</th>
              <SortableHeader field="client" label="Client" />
              <SortableHeader field="invoicedUSD" label="Inv. USD" right />
              <SortableHeader field="actualINR" label="Actual INR" right />
              <SortableHeader field="rate" label="Rate" right />
              <SortableHeader field="gap" label="Gap (₹)" right />
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Account</th>
              <SortableHeader field="date" label="Date" />
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {sortedSettlements.map((s: any) => {
              const displayStatus = s.actualInrReceived ? "SETTLED" : s.status;

              return (
                <tr key={s.id} onClick={() => router.push(`/invoices/${s.invoiceId}`)} className="hover:bg-neutral-800/30 transition-colors cursor-pointer">
                  <td className="px-5 py-4 font-medium">{s.invoice?.invoiceNumber || s.invoiceId}</td>
                  <td className="px-5 py-4 text-neutral-300">{s.invoice?.client?.name || "N/A"}</td>
                  <td className="px-5 py-4 text-right">${s.invoicedUSD}</td>
                  <td className="px-5 py-4 text-right font-medium">₹{s.actualInrReceived?.toLocaleString("en-IN") || 0}</td>
                  <td className="px-5 py-4 text-right text-neutral-400">{s.exchangeRate}</td>
                  <td className={`px-5 py-4 text-right font-medium ${s.settlementGap > 0 ? "text-rose-400" : (s.settlementGap < 0 ? "text-emerald-400" : "text-neutral-400")}`}>
                    {s.settlementGap > 0 ? "-" : (s.settlementGap < 0 ? "+" : "")}₹{Math.abs(s.settlementGap || 0).toLocaleString("en-IN")}
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
