import React from 'react';
import { useFormContext } from "react-hook-form";
import { useSettings } from "@/hooks/useSettings";

export function ExpensePaymentDetailsForm({ accounts }: { accounts: any[] }) {
  const { register } = useFormContext();
  const { paymentMethods } = useSettings();

  const validMethods = paymentMethods.filter(m => 
    m.type === 'Cash' || (m.type === 'Bank Transfer' && !(m.builtin && m.name === 'Bank Transfer'))
  );

  return (
    <div className="pt-4 border-t border-neutral-800 space-y-4">
      <h3 className="text-lg font-medium border-b border-neutral-800 pb-2">Payment Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Payment Method</label>
          <select {...register("paymentMethod")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
            <option value="">Select Method...</option>
            {validMethods.map(m => <option key={m.id} value={m.name}>{m.name} ({m.type})</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
