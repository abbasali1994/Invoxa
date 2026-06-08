"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import {
  Download, Search, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown,
  Minus, ChevronUp, ChevronDown, BookOpen, Loader2,
} from "lucide-react";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { useLedger, type LedgerTypeFilter } from "@/hooks/useLedger";

type SortField = 'date' | 'description' | 'inflowUSD' | 'inflowINR' | 'outflow' | 'runningNet' | null;
type SortDir = 'asc' | 'desc' | null;

const fmtUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

function SummaryCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  const Icon = positive === undefined ? Minus : positive ? TrendingUp : TrendingDown;
  const color = positive === undefined ? 'text-neutral-400' : positive ? 'text-emerald-400' : 'text-rose-400';
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500 uppercase tracking-wider font-medium">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      {sub && <span className="text-xs text-neutral-600">{sub}</span>}
    </div>
  );
}

const TYPE_TABS: { key: LedgerTypeFilter; label: string }[] = [
  { key: 'ALL', label: 'All Entries' },
  { key: 'INCOME', label: 'Invoices' },
  { key: 'EXPENSE', label: 'Expenses' },
];

export default function LedgerPage() {
  const { entries, summary, loading, dateRange, setDateRange, typeFilter, setTypeFilter, search, setSearch } = useLedger();

  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDir === 'desc') setSortDir('asc');
      else if (sortDir === 'asc') { setSortDir(null); setSortField(null); }
    } else {
      setSortField(field);
      setSortDir(field === 'description' ? 'asc' : 'desc');
    }
  };

  const sorted = [...entries].sort((a, b) => {
    if (!sortField || !sortDir) return 0;
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'date') return dir * (new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sortField === 'description') return dir * (a.description || '').localeCompare(b.description || '');
    if (sortField === 'inflowUSD') return dir * ((a.inflowUSD ?? 0) - (b.inflowUSD ?? 0));
    if (sortField === 'inflowINR') return dir * ((a.inflowINR ?? 0) - (b.inflowINR ?? 0));
    if (sortField === 'outflow') return dir * ((a.outflow ?? 0) - (b.outflow ?? 0));
    if (sortField === 'runningNet') return dir * ((a.runningNet ?? 0) - (b.runningNet ?? 0));
    return 0;
  });

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-indigo-400" />
      : <ChevronDown className="w-3 h-3 text-indigo-400" />;
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

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Invoice #', 'Client / Vendor', 'Category', 'Inflow ($)', 'Inflow (₹)', 'Outflow (₹)', 'Running Net (₹)'];
    const rows = sorted.map(e => [
      format(new Date(e.date), 'yyyy-MM-dd'),
      e.type,
      e.invoiceNumber || '',
      e.clientOrVendor || '',
      e.category || '',
      e.inflowUSD != null ? e.inflowUSD.toFixed(2) : '',
      e.inflowINR != null ? e.inflowINR.toFixed(2) : '',
      e.outflow != null ? e.outflow.toFixed(2) : '',
      e.runningNet?.toFixed(2) ?? '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${dateRange.from}-to-${dateRange.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const netPositive = summary.netIncome >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ledger</h2>
          <p className="text-neutral-400">Unified view of invoices, settlements, and expenses.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Link
            href="/ledger/trial-balance"
            className="flex items-center px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            <BookOpen className="w-4 h-4 mr-2" /> Trial Balance
          </Link>
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Invoiced ($)"
          value={fmtUSD(summary.totalInflowUSD)}
          sub={`${summary.invoiceCount} invoice${summary.invoiceCount !== 1 ? 's' : ''}, ${summary.settledCount} settled`}
          positive={undefined}
        />
        <SummaryCard
          label="Total Received (₹)"
          value={fmtINR(summary.totalInflowINR)}
          sub={`${summary.settledCount} settlement${summary.settledCount !== 1 ? 's' : ''}`}
          positive={true}
        />
        <SummaryCard
          label="Total Expenses (₹)"
          value={fmtINR(summary.totalOutflow)}
          sub={`${summary.expenseCount} expense${summary.expenseCount !== 1 ? 's' : ''}`}
          positive={false}
        />
        <SummaryCard
          label="Net Income (₹)"
          value={fmtINR(Math.abs(summary.netIncome))}
          sub={netPositive ? 'surplus' : 'deficit'}
          positive={netPositive}
        />
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-neutral-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by client, vendor, invoice #..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 pl-9 pr-4 text-sm text-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Type tabs */}
          <div className="flex gap-1">
            {TYPE_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  typeFilter === tab.key
                    ? 'bg-indigo-600 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-neutral-500">
                  {tab.key === 'ALL' && entries.length}
                  {tab.key === 'INCOME' && summary.invoiceCount}
                  {tab.key === 'EXPENSE' && summary.expenseCount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-neutral-500">
              <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading ledger...
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
                <tr>
                  <SortableHeader field="date" label="Date" />
                  <th className="px-5 py-3 font-medium">Type</th>
                  <SortableHeader field="description" label="Invoice #" />
                  <th className="px-5 py-3 font-medium">Client / Vendor</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <SortableHeader field="inflowUSD" label="Inflow ($)" right />
                  <SortableHeader field="inflowINR" label="Inflow (₹)" right />
                  <SortableHeader field="outflow" label="Outflow (₹)" right />
                  <SortableHeader field="runningNet" label="Running Net (₹)" right />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {sorted.map(entry => {
                  const isIncome = entry.type === 'INCOME';
                  const net = entry.runningNet ?? 0;
                  return (
                    <tr key={entry.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-5 py-4 text-neutral-400 whitespace-nowrap">
                        {format(new Date(entry.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          isIncome
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                          {isIncome ? (entry.isSettled ? 'Settled' : 'Invoice') : 'Expense'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-neutral-200">
                        {entry.invoiceNumber ?? entry.description}
                      </td>
                      <td className="px-5 py-4 text-neutral-300">
                        {entry.clientOrVendor || <span className="text-neutral-600">—</span>}
                      </td>
                      <td className="px-5 py-4 text-neutral-400">
                        {entry.category
                          ? <span className="px-2 py-0.5 bg-neutral-800 rounded text-xs">{entry.category}</span>
                          : <span className="text-neutral-700">—</span>}
                      </td>
                      {/* Inflow ($) */}
                      <td className="px-5 py-4 text-right font-medium">
                        {entry.inflowUSD != null
                          ? <span className="text-neutral-300">{fmtUSD(entry.inflowUSD)}</span>
                          : <span className="text-neutral-700">—</span>}
                      </td>
                      {/* Inflow (₹) */}
                      <td className="px-5 py-4 text-right font-medium">
                        {entry.inflowINR != null
                          ? <span className="text-emerald-400">{fmtINR(entry.inflowINR)}</span>
                          : <span className="text-neutral-700">—</span>}
                      </td>
                      {/* Outflow (₹) */}
                      <td className="px-5 py-4 text-right font-medium">
                        {entry.outflow != null
                          ? <span className="text-rose-400">{fmtINR(entry.outflow)}</span>
                          : <span className="text-neutral-700">—</span>}
                      </td>
                      {/* Running Net (₹) */}
                      <td className="px-5 py-4 text-right font-mono font-medium whitespace-nowrap">
                        <span className={net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {net < 0 ? '−' : '+'}{fmtINR(Math.abs(net))}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-14 text-center text-neutral-500">
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen className="w-10 h-10 text-neutral-700" />
                        <p>No ledger entries for this period.</p>
                        <p className="text-sm text-neutral-600">Try adjusting the date range or filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>

              {sorted.length > 0 && (
                <tfoot className="border-t border-neutral-700 bg-neutral-950/40 text-xs font-medium">
                  <tr>
                    <td colSpan={5} className="px-5 py-3 text-neutral-500">
                      {sorted.length} entries
                    </td>
                    <td className="px-5 py-3 text-right text-neutral-300">
                      {fmtUSD(sorted.reduce((s, e) => s + (e.inflowUSD ?? 0), 0))}
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-400">
                      {fmtINR(sorted.reduce((s, e) => s + (e.inflowINR ?? 0), 0))}
                    </td>
                    <td className="px-5 py-3 text-right text-rose-400">
                      {fmtINR(sorted.reduce((s, e) => s + (e.outflow ?? 0), 0))}
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      {(() => {
                        const net = summary.netIncome;
                        return (
                          <span className={net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {net < 0 ? '−' : '+'}{fmtINR(Math.abs(net))}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
