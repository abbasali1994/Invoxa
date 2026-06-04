import React from 'react';
import { useFormContext } from "react-hook-form";

export function PaymentDetailsForm() {
  const { register } = useFormContext();

  return (
    <div className="pt-4 border-t border-neutral-800 space-y-4">
      <h3 className="text-lg font-medium border-b border-neutral-800 pb-2">Invoice Address & Payment Details</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Payment Method</label>
          <select {...register("paymentMethod")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
            <option value="">Select Method...</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Crypto">Crypto</option>
            <option value="PayPal">PayPal</option>
            <option value="Wise">Wise</option>
          </select>
        </div>
        <div>
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
      </div>
    </div>
  );
}
