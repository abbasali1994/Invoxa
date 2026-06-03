"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, Copy, Loader2, Send, Trash2, ArrowRight, Share2, MessageCircle, Mail, Link as LinkIcon, Download, Star, Edit2, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dynamic from "next/dynamic";
import { InvoicePDFDocument } from "@/components/InvoicePDFDocument";
import { RecordSettlementModal } from "@/components/RecordSettlementModal";

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-neutral-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading PDF engine...</div>
});

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [settlementForm, setSettlementForm] = useState({
    receivedUSD: 0,
    exchangeRate: 83.5,
    platformFee: 0,
    transferFee: 0,
    taxDeducted: 0
  });

  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        setInvoice(data);
      })
      .catch(() => {
        toast.error("Invoice not found");
        router.push("/invoices");
      });
  }, [id, router]);

  if (!invoice) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

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
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed");
      setInvoice({ ...invoice, status });
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const toggleStar = async () => {
    try {
      const newStarred = !invoice.starred;
      setInvoice({ ...invoice, starred: newStarred });
      await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: newStarred })
      });
    } catch {
      toast.error("Failed to update star");
      setInvoice({ ...invoice, starred: !invoice.starred }); // revert
    }
  };

  const handleShare = (option: string) => {
    const text = `Invoice ${invoice.invoiceNumber}\nClient: ${invoice.client.name}\nAmount: ${invoice.currency} ${invoice.total}\nDue: ${invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}`;
    const fullUrl = window.location.href;
    
    switch (option) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + fullUrl)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(`Invoice ${invoice.invoiceNumber} | ${invoice.client.name} | ${invoice.currency} ${invoice.total}`)}`, '_blank');
        break;
      case 'gmail':
        const subject = `Invoice ${invoice.invoiceNumber} from Invoxa`;
        const body = `Hi ${invoice.client.name},\n\nPlease find your invoice details below:\n\nInvoice #: ${invoice.invoiceNumber}\nAmount: ${invoice.currency} ${invoice.total}\nDue Date: ${invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}\n\nView invoice: ${fullUrl}\n\nThank you.`;
        window.open(`mailto:${invoice.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(fullUrl);
        toast.success('Link copied to clipboard');
        break;
      case 'pdf':
        window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');
        break;
    }
  };

  const fetchInvoice = () => {
    fetch(`/api/invoices/${id}`).then(r=>r.json()).then(setInvoice);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center text-sm text-neutral-400 mb-2">
            <span className="hover:text-neutral-200 cursor-pointer" onClick={() => router.push('/invoices')}>Invoices</span>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-neutral-200">{invoice.invoiceNumber}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{invoice.invoiceNumber}</h2>
          <p className="text-neutral-400 mt-1">{invoice.client.name} • {format(new Date(invoice.createdAt), 'MMM d, yyyy')}</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={toggleStar} className="p-2 border border-neutral-700 rounded-md text-neutral-400 hover:text-yellow-500 hover:bg-neutral-800 transition-colors tooltip">
            <Star className={`w-4 h-4 ${invoice.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors outline-none">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-neutral-800">
              <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="hover:bg-neutral-800 cursor-pointer text-sm">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('telegram')} className="hover:bg-neutral-800 cursor-pointer text-sm">
                <Send className="w-4 h-4 mr-2" /> Telegram
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('gmail')} className="hover:bg-neutral-800 cursor-pointer text-sm">
                <Mail className="w-4 h-4 mr-2" /> Gmail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('copy')} className="hover:bg-neutral-800 cursor-pointer text-sm">
                <LinkIcon className="w-4 h-4 mr-2" /> Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('pdf')} className="hover:bg-neutral-800 cursor-pointer text-sm">
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button onClick={() => router.push(`/invoices/${invoice.id}/edit`)} className="p-2 border border-neutral-700 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors tooltip" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          
          <button onClick={handleDelete} disabled={isDeleting} className="p-2 border border-neutral-700 rounded-md text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
          {invoice.status === 'DRAFT' && (
            <button onClick={() => handleStatusChange('SENT')} className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Send className="w-4 h-4 mr-2" /> Send Invoice
            </button>
          )}
          {invoice.status === 'SENT' && (
            <button onClick={() => handleStatusChange('PAID')} className="flex items-center px-4 py-2 bg-emerald-600 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Paid
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h3 className="text-lg font-medium border-b border-neutral-800 pb-4 mb-4">Line Items</h3>
            <table className="w-full text-sm text-left">
              <thead className="text-neutral-500 border-b border-neutral-800">
                <tr>
                  <th className="py-2 font-medium">Description</th>
                  <th className="py-2 font-medium text-right">Qty</th>
                  <th className="py-2 font-medium text-right">Rate</th>
                  <th className="py-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-300">
                {invoice.lineItems.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="py-4">{item.description}</td>
                    <td className="py-4 text-right">{item.quantity}</td>
                    <td className="py-4 text-right">${item.rate}</td>
                    <td className="py-4 text-right font-medium">${item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 border-t border-neutral-800 pt-4 flex justify-end">
              <div className="w-64">
                <div className="flex justify-between font-bold text-xl">
                  <span>Total {invoice.currency}</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h3 className="text-lg font-medium border-b border-neutral-800 pb-4 mb-4">Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Current Status</span>
                <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md text-xs font-medium">
                  {invoice.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Due Date</span>
                <span className="text-sm font-medium">{invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h3 className="text-lg font-medium border-b border-neutral-800 pb-4 mb-4">Settlement Timeline</h3>
            
            {(!invoice.settlements || invoice.settlements.length === 0) && (
              <p className="text-sm text-neutral-500 mb-4">No settlements recorded yet.</p>
            )}
            
            {invoice.settlements && invoice.settlements.length > 0 && (
              <div className="space-y-4 mb-6">
                {invoice.settlements.map((settlement: any, i: number) => (
                  <div key={settlement.id} className="text-sm border-b border-neutral-800 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-neutral-300">Settlement {i + 1}</span>
                      <span className="text-xs text-neutral-500">{format(new Date(settlement.settledAt), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-neutral-400">
                      <div><span>₹{settlement.actualInrReceived?.toLocaleString('en-IN') || 0}</span></div>
                      <div className="text-right"><span>{settlement.paymentMethod}</span></div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-3 border-t border-neutral-700">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-neutral-300">Total Received:</span>
                    <span className="font-bold text-emerald-400">
                      ₹{invoice.settlements.reduce((sum: number, s: any) => sum + (s.actualInrReceived || 0), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 text-right mt-1">
                    Expected: ₹{(invoice.total * (invoice.settlements[0]?.exchangeRate || 83.5)).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            )}
            
            {invoice.status !== 'CANCELLED' && (
              <RecordSettlementModal invoice={invoice} onSaved={fetchInvoice}>
                <button className="w-full flex justify-center items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Record Settlement <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </RecordSettlementModal>
            )}
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex-col overflow-hidden h-[600px] flex">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
              <h3 className="text-sm font-medium flex items-center text-neutral-300">
                <FileText className="w-4 h-4 mr-2" /> Live PDF Preview
              </h3>
            </div>
            <div className="flex-1 w-full h-full bg-neutral-900">
              <PDFViewer width="100%" height="100%" className="border-0">
                <InvoicePDFDocument 
                  data={invoice} 
                  clientName={invoice.client.name} 
                />
              </PDFViewer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
