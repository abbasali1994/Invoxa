"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { InvoiceDetailHeader } from "@/components/invoices/InvoiceDetailHeader";
import { InvoiceLineItemsDisplay } from "@/components/invoices/InvoiceLineItemsDisplay";
import { InvoiceStatusCard } from "@/components/invoices/InvoiceStatusCard";
import { SettlementTimeline } from "@/components/invoices/SettlementTimeline";
import { InvoicePDFPreview } from "@/components/invoices/InvoicePDFPreview";

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInvoice = () => {
    fetch(`/api/invoices/${id}`).then(r => {
      if (!r.ok) throw new Error("Not found");
      return r.json();
    }).then(setInvoice).catch(() => {
      toast.error("Invoice not found");
      router.push("/invoices");
    });
  };

  useEffect(() => { fetchInvoice(); }, [id, router]);

  if (!invoice) return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      toast.success("Invoice deleted");
      router.push("/invoices");
    } catch {
      toast.error("Failed to delete");
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error("Failed");
      setInvoice({ ...invoice, status });
      toast.success(`Status updated to ${status}`);
    } catch { toast.error("Failed to update status"); }
  };

  const toggleStar = async () => {
    try {
      const newStarred = !invoice.starred;
      setInvoice({ ...invoice, starred: newStarred });
      await fetch(`/api/invoices/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ starred: newStarred }) });
    } catch {
      toast.error("Failed to update star");
      setInvoice({ ...invoice, starred: !invoice.starred });
    }
  };

  return (
    <div className="space-y-6">
      <InvoiceDetailHeader invoice={invoice} toggleStar={toggleStar} handleDelete={handleDelete} isDeleting={isDeleting} handleStatusChange={handleStatusChange} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InvoiceLineItemsDisplay invoice={invoice} />
        </div>
        <div className="space-y-6">
          <InvoiceStatusCard invoice={invoice} />
          <SettlementTimeline invoice={invoice} fetchInvoice={fetchInvoice} />
          <InvoicePDFPreview invoice={invoice} />
        </div>
      </div>
    </div>
  );
}
