import React from 'react';
import { FileText } from "lucide-react";
import { InvoiceRow } from "./InvoiceRow";

export interface InvoiceTableProps {
  invoices: any[];
  toggleStar: (id: string, currentStarred: boolean) => void;
  deleteDraft: (id: string) => void;
}

export function InvoiceTable({ invoices, toggleStar, deleteDraft }: InvoiceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-neutral-400">
        <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
          <tr>
            <th className="px-4 py-3 font-medium w-10"></th>
            <th className="px-5 py-3 font-medium">Invoice #</th>
            <th className="px-5 py-3 font-medium">Client</th>
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium">Created By</th>
            <th className="px-5 py-3 font-medium text-right">Amount</th>
            <th className="px-5 py-3 font-medium text-center">Status</th>
            <th className="px-5 py-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {invoices.map(inv => (
            <InvoiceRow 
              key={inv.id} 
              inv={inv} 
              toggleStar={toggleStar} 
              deleteDraft={deleteDraft} 
            />
          ))}
          {invoices.length === 0 && (
            <tr>
              <td colSpan={8} className="px-5 py-12 text-center text-neutral-500">
                <FileText className="w-8 h-8 text-neutral-700 mb-3 mx-auto" />
                <p>No invoices found.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
