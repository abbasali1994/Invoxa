import React from 'react';
import { Copy, Download, Edit2, Mail, MessageCircle, MoreVertical, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useInvoiceShare } from "@/hooks/useInvoiceShare";
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
  const { downloadPdf, handleShare } = useInvoiceShare(invoice);

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
        <DropdownMenuItem
          onClick={() => {
            const { id, invoiceNumber, status, createdAt, paidAt, deletedAt, starred, settlements, auditLogs, createdById, createdBy, workspaceId, ...rest } = invoice;
            sessionStorage.setItem('duplicate_invoice_data', JSON.stringify(rest));
            router.push('/invoices/new');
          }}
          className="hover:bg-neutral-800 cursor-pointer text-sm"
        >
          <Copy className="w-4 h-4 mr-2" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(invoice.id)} className="hover:bg-rose-500/10 cursor-pointer text-sm text-rose-400">
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
