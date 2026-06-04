import React from 'react';
import { Download, Edit2, Mail, MessageCircle, MoreVertical, Share2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type InvoiceShareMenuProps = {
  invoice: any;
  onDelete: (id: string) => void;
};

export function InvoiceShareMenu({ invoice, onDelete }: InvoiceShareMenuProps) {
  const router = useRouter();
  const pdfUrl = `/api/invoices/${invoice.id}/pdf`;
  const fileName = `invoice-${invoice.invoiceNumber || invoice.id}.pdf`;

  const getShareText = () => {
    const fullUrl = `${window.location.origin}/invoices/${invoice.id}`;
    const pdfFullUrl = `${window.location.origin}${pdfUrl}`;
    const dueDate = invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A';

    return {
      fullUrl,
      pdfFullUrl,
      text: `Invoice ${invoice.invoiceNumber} | ${invoice.client.name} | ${invoice.currency} ${invoice.total}`,
      emailBody: `Hi ${invoice.client.name},\n\nPlease find your invoice below.\n\nInvoice #: ${invoice.invoiceNumber}\nAmount: ${invoice.currency} ${invoice.total}\nDue Date: ${dueDate}\n\nDownload PDF: ${pdfFullUrl}\nView invoice: ${fullUrl}\n\nThank you.`
    };
  };

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const sharePdfFile = async () => {
    if (!('share' in navigator)) return false;

    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Failed to prepare PDF');

      const blob = await response.blob();
      const file = new File([blob], fileName, { type: 'application/pdf' });
      const shareData = {
        title: `Invoice ${invoice.invoiceNumber}`,
        text: `Invoice ${invoice.invoiceNumber}`,
        files: [file],
      };
      const nav = navigator as Navigator & {
        canShare?: (data: ShareData & { files?: File[] }) => boolean;
      };

      if (nav.canShare?.(shareData) === false) return false;
      await navigator.share(shareData);
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Could not share the PDF file directly');
      }
      return true;
    }
  };

  const handleShare = async (option: string) => {
    const { fullUrl, pdfFullUrl, text, emailBody } = getShareText();

    switch (option) {
      case 'whatsapp':
        if (await sharePdfFile()) break;
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\nDownload PDF: ${pdfFullUrl}\n${fullUrl}`)}`, '_blank');
        break;
      case 'gmail':
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(invoice.client.email || '')}&su=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}&body=${encodeURIComponent(emailBody)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:${invoice.client.email || ''}?subject=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}&body=${encodeURIComponent(emailBody)}`, '_blank');
        break;
      case 'native':
        if (!(await sharePdfFile())) {
          await navigator.clipboard.writeText(pdfFullUrl);
          toast.success('PDF link copied');
        }
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors outline-none" title="Invoice actions">
        <MoreVertical className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 bg-neutral-900 border-neutral-800">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="hover:bg-neutral-800 cursor-pointer text-sm">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48 bg-neutral-900 border-neutral-800">
            <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="hover:bg-neutral-800 cursor-pointer text-sm">
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="hover:bg-neutral-800 cursor-pointer text-sm">
                <Mail className="w-4 h-4 mr-2" /> Gmail
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44 bg-neutral-900 border-neutral-800">
                <DropdownMenuItem onClick={() => handleShare('gmail')} className="hover:bg-neutral-800 cursor-pointer text-sm">
                  Gmail compose
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('email')} className="hover:bg-neutral-800 cursor-pointer text-sm">
                  Email app
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={() => handleShare('native')} className="hover:bg-neutral-800 cursor-pointer text-sm">
              <Share2 className="w-4 h-4 mr-2" /> Share PDF file
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={downloadPdf} className="hover:bg-neutral-800 cursor-pointer text-sm">
          <Download className="w-4 h-4 mr-2" /> Download PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}/edit`)} className="hover:bg-neutral-800 cursor-pointer text-sm">
          <Edit2 className="w-4 h-4 mr-2" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(invoice.id)} className="hover:bg-rose-500/10 cursor-pointer text-sm text-rose-400">
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
