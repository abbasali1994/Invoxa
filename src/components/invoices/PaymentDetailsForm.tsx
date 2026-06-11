import React from 'react';
import { useFormContext } from "react-hook-form";
import { useSettings } from "@/hooks/useSettings";
import { PaymentMethod, PAYMENT_METHOD_LABELS } from "@/lib/paymentMethods";
import { Plus, Trash2 } from "lucide-react";

export function PaymentDetailsForm() {
  const { register, setValue, watch } = useFormContext();
  const { paymentMethods } = useSettings();
  
  const paymentMethodType = watch("paymentMethod");
  const uniqueTypes = Array.from(new Set(paymentMethods.map(m => m.type)));
  const savedAccounts = paymentMethods.filter(m => m.type === paymentMethodType && !m.builtin);
  
  const hideBankFields = paymentMethodType === PaymentMethod.CRYPTO;
  const isCash = paymentMethodType === PaymentMethod.CASH;

  const bankAccountNameValue = watch("bankAccountName");
  const bankNameValue = watch("bankName");
  const accountNumberValue = watch("accountNumber");
  const ifscCodeValue = watch("ifscCode");
  const swiftCodeValue = watch("swiftCode");

  // Parse customFields
  let customFields = [];
  try {
    if (bankAccountNameValue && bankAccountNameValue.startsWith('[')) {
      customFields = JSON.parse(bankAccountNameValue);
    } else {
      customFields = [
        { key: 'Account Name', value: bankAccountNameValue || '' },
        { key: 'Account Number', value: accountNumberValue || '' },
        { key: 'Bank Name', value: bankNameValue || '' },
        { key: 'IFSC Code', value: ifscCodeValue || '' },
        { key: 'SWIFT Code', value: swiftCodeValue || '' }
      ];
    }
  } catch {
    customFields = [];
  }

  const updateCustomFields = (updated: any[]) => {
    setValue("bankAccountName", JSON.stringify(updated));
    
    // Extrapolate to standard fields for db compat
    const getVal = (keys: string[]) => {
      const found = updated.find((f: any) => 
        keys.some(k => f.key?.toLowerCase().trim() === k.toLowerCase())
      );
      return found ? found.value : '';
    };

    setValue("accountNumber", getVal(['account number', 'account no', 'a/c', 'a/c no']));
    setValue("bankName", getVal(['bank name', 'bank']));
    setValue("ifscCode", getVal(['ifsc code', 'ifsc']));
    setValue("swiftCode", getVal(['swift code', 'swift']));
  };

  return (
    <div className="pt-4 border-t border-neutral-800 space-y-4">
      <h3 className="text-lg font-medium border-b border-neutral-800 pb-2">Invoice Address & Payment Details</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className={hideBankFields ? "col-span-2" : ""}>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Payment Method</label>
          <select {...register("paymentMethod")} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
            <option value="">Select Method...</option>
            <option value={PaymentMethod.BANK_TRANSFER}>{PAYMENT_METHOD_LABELS[PaymentMethod.BANK_TRANSFER]}</option>
            <option value={PaymentMethod.CRYPTO}>{PAYMENT_METHOD_LABELS[PaymentMethod.CRYPTO]}</option>
            <option value={PaymentMethod.CASH}>{PAYMENT_METHOD_LABELS[PaymentMethod.CASH]}</option>
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
                  if (acc.customFields && acc.customFields.length > 0) {
                    setValue("bankAccountName", JSON.stringify(acc.customFields));
                  } else {
                    setValue("bankAccountName", acc.bankAccountName || acc.name || '');
                  }
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
          <div className="col-span-2 space-y-3 p-3 bg-neutral-900/30 rounded-lg border border-neutral-850">
            <div className="text-xs font-semibold text-neutral-400 mb-1">Bank Details (Key-Value Pairs)</div>
            {customFields.map((field: any, index: number) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Key (e.g. Account No)"
                  value={field.key}
                  onChange={(e) => {
                    const updated = [...customFields];
                    updated[index].key = e.target.value;
                    updateCustomFields(updated);
                  }}
                  className="flex-1 bg-neutral-950 border border-neutral-700 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                />
                <span className="text-neutral-500">----</span>
                <input
                  type="text"
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => {
                    const updated = [...customFields];
                    updated[index].value = e.target.value;
                    updateCustomFields(updated);
                  }}
                  className="flex-[1.5] bg-neutral-950 border border-neutral-700 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = customFields.filter((_: any, i: number) => i !== index);
                    updateCustomFields(updated);
                  }}
                  className="p-1.5 hover:bg-neutral-800 rounded text-neutral-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const updated = [...customFields, { key: '', value: '' }];
                updateCustomFields(updated);
              }}
              className="w-full flex items-center justify-center py-1.5 border border-dashed border-neutral-800 hover:border-neutral-700 rounded text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Detail Row
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
