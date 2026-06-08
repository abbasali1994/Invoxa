import React from 'react';
import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import Decimal from "decimal.js";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";

export function ExpenseLineItemsTable({ subtotal, total }: { subtotal: number, total: number }) {
  const { control, register, watch, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });
  const watchLineItems = watch("lineItems") || [];
  const currency = watch("currency") || "INR";

  return (
    <div className="pt-4 border-t border-neutral-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Line Items</h3>
        <div className="flex space-x-3">
          <button type="button" onClick={() => append({ description: "", hours: 0, cost: 0, amount: 0, isSection: true })} className="text-indigo-400 text-sm flex items-center hover:text-indigo-300"><Plus className="w-4 h-4 mr-1" /> Add Section</button>
          <button type="button" onClick={() => append({ description: "", hours: 1, cost: 0, amount: 0, isSection: false })} className="text-indigo-400 text-sm flex items-center hover:text-indigo-300"><Plus className="w-4 h-4 mr-1" /> Add Row</button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 80px 110px 40px', gap: '8px', alignItems: 'center' }} className="text-sm font-medium text-neutral-400 px-1">
          <span>Description</span><span className="text-right">Qty</span><span className="text-right">Amount</span><span></span>
        </div>

        {fields.map((field, index) => {
          const isSec = watchLineItems[index]?.isSection;
          return (
            <div key={field.id} style={{ display: 'grid', gridTemplateColumns: '3fr 80px 110px 40px', gap: '8px', alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <input {...register(`lineItems.${index}.description` as const)} placeholder={isSec ? "Section Header" : "Description"} className={`w-full min-w-0 bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none ${isSec ? 'font-bold text-indigo-400' : ''}`} />
                {(errors.lineItems as any)?.[index]?.description && <p className="text-rose-500 text-xs mt-1">{(errors.lineItems as any)[index]?.description?.message}</p>}
              </div>
              {!isSec ? (
                <>
                  <input type="number" step="0.1" {...register(`lineItems.${index}.hours` as const, { valueAsNumber: true })} placeholder="0" className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm text-right focus:ring-1 focus:ring-indigo-500 outline-none min-w-0" />
                  <input type="number" step="0.01" {...register(`lineItems.${index}.amount` as const, { valueAsNumber: true })} placeholder="0.00" className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm text-right focus:ring-1 focus:ring-indigo-500 outline-none min-w-0" />
                </>
              ) : <div className="col-span-2"></div>}
              <button type="button" onClick={() => remove(index)} className="p-2 text-neutral-500 hover:text-rose-400 transition-colors flex justify-center min-w-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          );
        })}
        {(errors.lineItems as any)?.root && <p className="text-rose-500 text-xs mt-1">{(errors.lineItems as any).root.message}</p>}
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-64 space-y-3">
          <div className="flex justify-between font-medium text-sm"><span>Subtotal</span><CurrencyDisplay amount={subtotal} currency={currency} size="sm" /></div>
          <div className="flex justify-between font-medium text-lg border-t border-neutral-800 pt-3"><span>Total</span><CurrencyDisplay amount={total} currency={currency} size="lg" /></div>
        </div>
      </div>
    </div>
  );
}
