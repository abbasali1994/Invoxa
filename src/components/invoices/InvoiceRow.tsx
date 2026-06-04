import React from 'react';
import Link from "next/link";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { InvoiceShareMenu } from "./InvoiceShareMenu";

export interface InvoiceRowProps {
  inv: any;
  toggleStar: (id: string, currentStarred: boolean) => void;
  deleteInvoice: (id: string) => void;
}

export function InvoiceRow({ inv, toggleStar, deleteInvoice }: InvoiceRowProps) {
  return (
    <tr className="hover:bg-neutral-800/30 transition-colors">
      <td className="px-4 py-4 text-center">
        <button onClick={() => toggleStar(inv.id, inv.starred)} className="text-neutral-500 hover:text-yellow-500 transition-colors">
          <Star className={`w-4 h-4 ${inv.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
        </button>
      </td>
      <td className="px-5 py-4 font-medium text-neutral-200">
        <Link href={`/invoices/${inv.id}`} className="hover:underline">
          {inv.invoiceNumber}
        </Link>
      </td>
      <td className="px-5 py-4 text-neutral-300">{inv.client.name}</td>
      <td className="px-5 py-4">{format(new Date(inv.createdAt), 'MMM d, yyyy')}</td>
      <td className="px-5 py-4">
        {inv.createdBy ? (
          <div className="flex items-center gap-2">
            {inv.createdBy.image && (
              <img src={inv.createdBy.image} alt="" className="w-5 h-5 rounded-full flex-shrink-0" />
            )}
            <span className="text-xs text-neutral-400 truncate max-w-[100px]" title={inv.createdBy.name ?? inv.createdBy.email}>
              {inv.createdBy.name ?? inv.createdBy.email}
            </span>
          </div>
        ) : (
          <span className="text-xs text-neutral-600">—</span>
        )}
      </td>
      <td className="px-5 py-4 text-right font-medium text-neutral-200">${inv.total.toFixed(2)}</td>
      <td className="px-5 py-4 text-center">
        <InvoiceStatusBadge status={inv.status} />
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end space-x-2">
          <InvoiceShareMenu invoice={inv} onDelete={deleteInvoice} />
        </div>
      </td>
    </tr>
  );
}
