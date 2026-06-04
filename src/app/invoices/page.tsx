"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoiceTabBar } from "@/components/invoices/InvoiceTabBar";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [counts, setCounts] = useState({ all: 0, sent: 0, paid: 0, overdue: 0, draft: 0 });
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const fetchInvoices = (tab: string) => {
    let url = `/api/invoices?status=${tab === 'all' ? 'active' : tab.toUpperCase()}`;
    fetch(url).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setInvoices(data);
    }).catch(() => toast.error("Failed to load invoices"));
  };

  const fetchCounts = () => {
    fetch('/api/invoices/counts').then(res => res.json()).then(setCounts).catch(() => {});
  };

  useEffect(() => {
    fetchCounts();
    fetchInvoices(activeTab);
  }, [activeTab]);

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
          <p className="text-neutral-400">Manage and track your billing pipeline.</p>
        </div>
        <Link href="/invoices/new" className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" /> New Invoice
        </Link>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
        <div className="p-4 border-b border-neutral-800 flex gap-4">
          <InvoiceFilters search={search} setSearch={setSearch} />
          <InvoiceTabBar counts={counts} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <InvoiceTable invoices={filtered} toggleStar={toggleStar} deleteInvoice={deleteInvoice} />
      </div>
    </div>
  );
}
