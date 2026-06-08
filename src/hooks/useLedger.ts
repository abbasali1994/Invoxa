import { useState, useEffect } from "react";
import { defaultDateRange, type DateRange } from "@/components/ui/DateRangePicker";

export type LedgerTypeFilter = 'ALL' | 'INCOME' | 'EXPENSE';

export interface LedgerSummary {
  totalInflowUSD: number;
  totalInflowINR: number;
  totalOutflow: number;
  netIncome: number;
  invoiceCount: number;
  settledCount: number;
  expenseCount: number;
}

const DEFAULT_SUMMARY: LedgerSummary = {
  totalInflowUSD: 0,
  totalInflowINR: 0,
  totalOutflow: 0,
  netIncome: 0,
  invoiceCount: 0,
  settledCount: 0,
  expenseCount: 0,
};

export function useLedger() {
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<LedgerSummary>(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [typeFilter, setTypeFilter] = useState<LedgerTypeFilter>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ from: dateRange.from, to: dateRange.to });

    fetch(`/api/ledger?${params}`)
      .then(res => res.json())
      .then(data => {
        setAllEntries(data.entries ?? []);
        setSummary(data.summary ?? DEFAULT_SUMMARY);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dateRange]);

  const entries = allEntries.filter(e => {
    if (typeFilter !== 'ALL' && e.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.description?.toLowerCase().includes(q) ||
        e.clientOrVendor?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.invoiceNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return {
    entries,
    summary,
    loading,
    dateRange,
    setDateRange,
    typeFilter,
    setTypeFilter,
    search,
    setSearch,
  };
}
