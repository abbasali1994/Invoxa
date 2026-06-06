import React from 'react';
import { useFormContext } from "react-hook-form";
import { useSettings } from "@/hooks/useSettings";

export function PaymentDetailsForm() {
  const { register, setValue, watch } = useFormContext();
  const { paymentMethods } = useSettings();
  
  const paymentMethodType = watch("paymentMethod");
  const uniqueTypes = Array.from(new Set(paymentMethods.map(m => m.type)));
  const savedAccounts = paymentMethods.filter(m => m.type === paymentMethodType && !(m.builtin && m.name === m.type));
  
  const hideBankFields = paymentMethodType === 'Cash' || paymentMethodType === 'Token Transfer (Crypto)';

  return (
    <div className="pt-4 border-t border-neutral-800 space-y-4">
      <h3 className="text-lg font-medium border-b border-neutral-800 pb-2">Invoice Address & Payment Details</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Payment Method</label>
          <select {...register("paymentMethod")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
            <option value="">Select Method...</option>
            {uniqueTypes.map(t => (
              <option key={t as string} value={t as string}>{t as string}</option>
            ))}
          </select>
        </div>
        {savedAccounts.length > 0 && (
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-indigo-400 mb-1">Select Saved Account (Auto-fill)</label>
            <select 
              onChange={(e) => {
                const account = savedAccounts.find(a => a.id === e.target.value);
                if (account) {
                  setValue("bankAccountName", account.bankAccountName || '', { shouldDirty: true });
                  setValue("bankName", account.bankName || '', { shouldDirty: true });
                  setValue("accountNumber", account.accountNumber || '', { shouldDirty: true });
                  setValue("ifscCode", account.ifscCode || '', { shouldDirty: true });
                }
              }} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="">-- Choose Account --</option>
              {savedAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        )}
        {!hideBankFields && (
          <>
            <div className={savedAccounts.length > 0 ? "" : "col-span-1"}>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Bank Account Name</label>
              <input type="text" {...register("bankAccountName")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Bank Name</label>
              <input type="text" {...register("bankName")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Account Number</label>
              <input type="text" {...register("accountNumber")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">IFSC Code</label>
              <input type="text" {...register("ifscCode")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">SWIFT Code</label>
              <input type="text" {...register("swiftCode")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
