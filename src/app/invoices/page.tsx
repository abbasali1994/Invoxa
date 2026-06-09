"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoiceTabBar } from "@/components/invoices/InvoiceTabBar";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { DateRangePicker, defaultDateRange } from "@/components/ui/DateRangePicker";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState(defaultDateRange());
  const [counts, setCounts] = useState({ all: 0, sent: 0, paid: 0, overdue: 0, draft: 0 });
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const fetchInvoices = (tab: string, range = dateRange) => {
    let url = `/api/invoices?status=${tab === 'all' ? 'ALL' : tab.toUpperCase()}`;
    if (range.from && range.to) {
      url += `&from=${range.from}&to=${range.to}`;
    }
    fetch(url).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setInvoices(data);
    }).catch(() => toast.error("Failed to load invoices"));
  };

  const fetchCounts = (range = dateRange) => {
    let url = '/api/invoices/counts';
    if (range.from && range.to) {
      url += `?from=${range.from}&to=${range.to}`;
    }
    fetch(url).then(res => res.json()).then(setCounts).catch(() => {});
  };

  useEffect(() => {
    fetchCounts(dateRange);
    fetchInvoices(activeTab, dateRange);
  }, [activeTab, dateRange]);

  const filtered = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
    inv.client.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStar = async (id: string, currentStarred: boolean) => {
    setInvoices(invoices.map(i => i.id === id ? { ...i, starred: !currentStarred } : i));
    try {
      await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: !currentStarred })
      });
    } catch {
      toast.error('Failed to update star');
      fetchInvoices(activeTab);
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      toast.success('Invoice deleted');
      fetchInvoices(activeTab);
      fetchCounts();
    } catch {
      toast.error('Failed to delete invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
          <p className="text-neutral-400">Manage and track your billing pipeline.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Link href="/invoices/new" className="flex items-center justify-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> New Invoice
          </Link>
        </div>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
        <div className="p-4 border-b border-neutral-800 flex flex-col gap-3">
          <InvoiceFilters search={search} setSearch={setSearch} />
          <InvoiceTabBar counts={counts} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <InvoiceTable invoices={filtered} toggleStar={toggleStar} deleteInvoice={deleteInvoice} />
      </div>
    </div>
  );
}
