import React from "react";
import { DatePicker } from "@/components/ui/DatePicker";

export function SettlementFormFields({ register, rateStatus, accounts, settlementDateValue }: any) {
  return (
    <>
      <div className="pt-2 border-t border-neutral-800">
        <label className="block font-medium mb-1">Actual INR Received *</label>
        <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded focus-within:ring-1 focus-within:ring-indigo-500 overflow-hidden">
          <span className="px-3 text-neutral-500 border-r border-neutral-800 bg-neutral-900">₹</span>
          <input type="number" step="0.01" {...register("actualInrReceived", { required: true, min: 1 })} placeholder="81350" className="w-full p-2 bg-transparent outline-none" />
        </div>
        <p className="text-xs text-neutral-500 mt-1">Enter the exact amount credited to your bank account</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Exchange Rate (USD/INR)</label>
          <div className="relative">
            <input type="number" step="0.01" {...register("exchangeRate", { valueAsNumber: true })} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 outline-none focus:ring-1 focus:ring-indigo-500" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {rateStatus === "live" && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Live rate</span>}
              {rateStatus === "fallback" && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">Fallback</span>}
              {rateStatus === "loading" && <span className="text-[10px] bg-neutral-500/10 text-neutral-400 px-1.5 py-0.5 rounded animate-pulse">Loading...</span>}
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Edit if actual rate differs.</p>
        </div>
        <div>
          <label className="block font-medium mb-1">Settlement Date</label>
          <DatePicker {...register("settlementDate")} value={settlementDateValue} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Payment Method</label>
          <select {...register("paymentMethod")} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="WISE">Wise</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="PAYPAL">PayPal</option>
            <option value="CRYPTO">Crypto</option>
            <option value="STRIPE">Stripe</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Receiving Account</label>
          <select {...register("receivingAccountId")} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="">None (Skip Ledger)</option>
            {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Notes (optional)</label>
        <textarea {...register("notes")} placeholder="Wise transfer after FX deduction." className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 outline-none focus:ring-1 focus:ring-indigo-500 resize-none h-10" />
      </div>
    </>
  );
}
