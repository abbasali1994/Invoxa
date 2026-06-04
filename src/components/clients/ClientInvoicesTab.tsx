import React from "react";
import { format } from "date-fns";
import Link from "next/link";
import { FileStack } from "lucide-react";
import { StatusBadge } from "@/components/clients/StatusBadge";

export function ClientInvoicesTab({ client }: { client: any }) {
  if (!client.invoices?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
        <FileStack className="w-12 h-12 mb-4 opacity-20" />
        <p>No invoices yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
          <tr>
            <th className="px-5 py-4 font-medium">Invoice #</th>
            <th className="px-5 py-4 font-medium">Date</th>
            <th className="px-5 py-4 font-medium">Due Date</th>
            <th className="px-5 py-4 font-medium">Amount</th>
            <th className="px-5 py-4 font-medium">Status</th>
            <th className="px-5 py-4 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {client.invoices.map((inv: any) => (
            <tr key={inv.id} className="hover:bg-neutral-800/30 transition-colors">
              <td className="px-5 py-4 font-medium text-white">{inv.invoiceNumber}</td>
              <td className="px-5 py-4 text-neutral-400">{format(new Date(inv.createdAt), 'MMM d, yyyy')}</td>
              <td className="px-5 py-4 text-neutral-400">{inv.dueDate ? format(new Date(inv.dueDate), 'MMM d, yyyy') : 'N/A'}</td>
              <td className="px-5 py-4 text-white font-medium">${inv.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              <td className="px-5 py-4"><StatusBadge status={inv.status} /></td>
              <td className="px-5 py-4 text-right">
                <Link href={`/invoices/${inv.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
