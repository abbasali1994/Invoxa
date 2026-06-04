import React from 'react';
import { useFormContext } from "react-hook-form";
import { ClientSelector } from "./ClientSelector";

export function InvoiceMetaForm({ clients }: { clients: any[] }) {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium border-b border-neutral-800 pb-2">Invoice Meta</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">From</label>
          <input type="text" {...register("senderName")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Date</label>
          <input type="date" {...register("date")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Invoice #</label>
          <input type="text" {...register("invoiceNumber")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Due Date</label>
          <input type="date" {...register("dueDate")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
        </div>
      </div>
      <ClientSelector clients={clients} />
    </div>
  );
}
