import React from 'react';
import { Share2, MessageCircle, Send, Mail, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function InvoiceShareMenu({ invoice }: { invoice: any }) {
  const handleShare = (option: string) => {
    const text = `Invoice ${invoice.invoiceNumber} | ${invoice.client.name} | ${invoice.currency} ${invoice.total}`;
    const fullUrl = `${window.location.origin}/invoices/${invoice.id}`;
    
    switch (option) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + fullUrl)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'gmail':
        const body = `Hi ${invoice.client.name},\n\nPlease find your invoice details below:\n\nInvoice #: ${invoice.invoiceNumber}\nAmount: ${invoice.currency} ${invoice.total}\nDue Date: ${invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}\n\nView invoice: ${fullUrl}\n\nThank you.`;
        window.open(`mailto:${invoice.client.email}?subject=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}&body=${encodeURIComponent(body)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(fullUrl);
        toast.success('Link copied');
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors outline-none">
        <Share2 className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-neutral-900 border-neutral-800">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
