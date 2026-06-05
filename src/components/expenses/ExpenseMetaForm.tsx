import React from 'react';
import { useFormContext } from "react-hook-form";
import { DatePicker } from "@/components/ui/DatePicker";

export function ExpenseMetaForm({ accounts }: { accounts: any[] }) {
  const { register, watch, formState: { errors } } = useFormContext();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1">Vendor Name</label>
        <input type="text" {...register("vendor")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
        {(errors.vendor as any) && <p className="text-rose-500 text-xs mt-1">{(errors.vendor as any).message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1">Expense #</label>
        <input type="text" {...register("expenseNumber")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1">Date</label>
        <DatePicker {...register("date")} value={watch("date") || ""} />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1">Category</label>
        <select {...register("category")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
          <option value="">Select Category...</option>
          {['Software', 'Travel', 'Marketing', 'Office', 'Contractors', 'Utilities', 'Subscriptions', 'Reimbursements', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(errors.category as any) && <p className="text-rose-500 text-xs mt-1">{(errors.category as any).message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1">Currency</label>
        <select {...register("currency")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
          {['USD', 'INR', 'GBP', 'EUR', 'CAD', 'CHF'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1">Account</label>
        <select {...register("accountId")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
          <option value="">Select Account...</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div className="flex items-center space-x-2 mt-6">
        <input type="checkbox" id="isRecurring" {...register("isRecurring")} className="w-4 h-4 rounded border-neutral-800 bg-neutral-950 text-indigo-600 focus:ring-indigo-500" />
        <label htmlFor="isRecurring" className="text-sm font-medium text-neutral-300">Is Recurring</label>
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-neutral-300 mb-1">Notes</label>
        <textarea {...register("notes")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none h-20 resize-none"></textarea>
      </div>
    </div>
  );
}
