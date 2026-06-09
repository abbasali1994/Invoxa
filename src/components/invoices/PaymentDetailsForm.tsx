import React from 'react';
import { useFormContext } from "react-hook-form";
import { useSettings } from "@/hooks/useSettings";

export function PaymentDetailsForm() {
  const { register, setValue, watch } = useFormContext();
  const { paymentMethods } = useSettings();
  
  const paymentMethodType = watch("paymentMethod");
  const uniqueTypes = Array.from(new Set(paymentMethods.map(m => m.type)));
  const savedAccounts = paymentMethods.filter(m => m.type === paymentMethodType && !(m.builtin && m.name === m.type));
  
  const hideBankFields = paymentMethodType === 'Crypto' || paymentMethodType === 'Token Transfer (Crypto)';
  const isCash = paymentMethodType === 'Cash';

  return (
    <div className="pt-4 border-t border-neutral-800 space-y-4">
      <h3 className="text-lg font-medium border-b border-neutral-800 pb-2">Invoice Address & Payment Details</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className={hideBankFields ? "col-span-2" : ""}>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Payment Method</label>
          <select {...register("paymentMethod")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
            <option value="">Select Method...</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Crypto">Token Transfer (Crypto)</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        {savedAccounts.length > 0 && (
          <div className="col-span-2 flex items-center gap-3 bg-indigo-500/5 border border-indigo-500/20 rounded-md p-3 mb-2">
            <label className="text-sm font-medium text-indigo-300 whitespace-nowrap">Autofill from Settings:</label>
            <select 
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              onChange={(e) => {
                const acc = savedAccounts.find(a => a.id === e.target.value);
                if (acc) {
                  setValue("bankAccountName", acc.bankAccountName || acc.name || '');
                  setValue("bankName", acc.bankName || '');
                  setValue("accountNumber", acc.accountNumber || '');
                  setValue("ifscCode", acc.ifscCode || '');
                  setValue("swiftCode", acc.swiftCode || '');
                }
              }}
            >
              <option value="">-- Choose a saved account --</option>
              {savedAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        )}

        {isCash ? null : hideBankFields ? (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Currency</label>
              <select {...register("bankName")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                <option value="">Select Currency...</option>
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Network</label>
              <select {...register("bankAccountName")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                <option value="">Select Network...</option>
                <option value="TRC20 (Tron)">TRC20 (Tron)</option>
                <option value="ERC20 (Ethereum)">ERC20 (Ethereum)</option>
                <option value="BEP20 (BNB Smart Chain)">BEP20 (BNB Smart Chain)</option>
                <option value="Polygon">Polygon</option>
                <option value="Solana">Solana</option>
                <option value="Arbitrum">Arbitrum</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-300 mb-1">Wallet Address</label>
              <input type="text" {...register("accountNumber")} placeholder="0x..." className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none font-mono" />
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
