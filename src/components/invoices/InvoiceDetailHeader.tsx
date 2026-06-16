import React from 'react';
import { ChevronRight, Star, Share2, MessageCircle, Send, Mail, Link as LinkIcon, Download, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface InvoiceDetailHeaderProps {
  invoice: any; toggleStar: () => void; handleDelete: () => void; isDeleting: boolean; handleStatusChange: (status: string) => void;
}

export function InvoiceDetailHeader({ invoice, toggleStar, handleDelete, isDeleting, handleStatusChange }: InvoiceDetailHeaderProps) {
  const router = useRouter();

  const handleShare = (option: string) => {
    const text = `Invoice ${invoice.invoiceNumber}\nClient: ${invoice.client.name}\nAmount: ${invoice.currency} ${invoice.total}\nDue: ${invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}`;
    const fullUrl = window.location.href;
    if (option === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + fullUrl)}`, '_blank');
    else if (option === 'telegram') window.open(`https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(`Invoice ${invoice.invoiceNumber} | ${invoice.client.name} | ${invoice.currency} ${invoice.total}`)}`, '_blank');
    else if (option === 'gmail') window.open(`mailto:${invoice.client.email}?subject=${encodeURIComponent(`Invoice ${invoice.invoiceNumber} from Settlr`)}&body=${encodeURIComponent(`Hi ${invoice.client.name},\n\nPlease find your invoice details below:\n\nInvoice #: ${invoice.invoiceNumber}\nAmount: ${invoice.currency} ${invoice.total}\nDue Date: ${invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}\n\nView invoice: ${fullUrl}\n\nThank you.`)}`, '_blank');
    else if (option === 'copy') { navigator.clipboard.writeText(fullUrl); toast.success('Link copied to clipboard'); }
    else if (option === 'pdf') window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');
  };

  return (
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center text-sm text-neutral-400 mb-2">
          <span className="hover:text-neutral-200 cursor-pointer" onClick={() => router.push('/invoices')}>Invoices</span><ChevronRight className="w-4 h-4 mx-1" /><span className="text-neutral-200">{invoice.invoiceNumber}</span>
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
            <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="hover:bg-neutral-800 cursor-pointer text-sm"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('telegram')} className="hover:bg-neutral-800 cursor-pointer text-sm"><Send className="w-4 h-4 mr-2" /> Telegram</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('gmail')} className="hover:bg-neutral-800 cursor-pointer text-sm"><Mail className="w-4 h-4 mr-2" /> Gmail</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('copy')} className="hover:bg-neutral-800 cursor-pointer text-sm"><LinkIcon className="w-4 h-4 mr-2" /> Copy Link</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('pdf')} className="hover:bg-neutral-800 cursor-pointer text-sm"><Download className="w-4 h-4 mr-2" /> Download PDF</DropdownMenuItem>
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
  );
}

