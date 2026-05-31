"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function RecordSettlementModal({ invoice, onSaved, children }: { invoice: any, onSaved: () => void, children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const { register, watch, setValue, handleSubmit, reset } = useForm({
    defaultValues: {
      actualInrReceived: "",
      exchangeRate: 83.5,
      paymentMethod: "WISE",
      receivingAccountId: "",
      settlementDate: new Date().toISOString().split('T')[0],
      deductions: "",
      notes: ""
    }
  });

  const [rateStatus, setRateStatus] = useState<"loading" | "live" | "fallback">("loading");

  useEffect(() => {
    if (open) {
      fetch('/api/accounts').then(res => res.json()).then(data => {
        if (Array.isArray(data)) {
          setAccounts(data);
          if (data.length > 0) setValue('receivingAccountId', data[0].id);
        }
      }).catch(() => {});

      const fetchExchangeRate = async () => {
        setRateStatus("loading");
        try {
          const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR');
          const data = await res.json();
          setValue('exchangeRate', data.rates.INR);
          setRateStatus("live");
        } catch {
          setValue('exchangeRate', 83.5);
          setRateStatus("fallback");
        }
      };
      fetchExchangeRate();
    }
  }, [open, setValue]);

  const actualInrReceived = parseFloat(watch("actualInrReceived") as string) || 0;
  const exchangeRate = watch("exchangeRate") || 0;
  
  const expectedINR = (invoice.total * exchangeRate);
  const settlementGap = expectedINR - actualInrReceived;
  
  const onSubmit = async (data: any) => {
    try {
      const res = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          actualInrReceived: parseFloat(data.actualInrReceived),
          exchangeRate: parseFloat(data.exchangeRate),
          paymentMethod: data.paymentMethod,
          receivingAccountId: data.receivingAccountId,
          settlementDate: data.settlementDate,
          deductions: parseFloat(data.deductions) || 0,
          notes: data.notes
        })
      });
      if (!res.ok) throw new Error("Failed");
      onSaved();
      setOpen(false);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Record Settlement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2 text-sm text-neutral-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Invoice Number</label>
              <input className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-500 cursor-not-allowed" readOnly value={invoice.invoiceNumber} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Client Name</label>
              <input className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-500 cursor-not-allowed" readOnly value={invoice.client.name} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Invoice Amount</label>
              <input className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-500 cursor-not-allowed" readOnly value={`$${invoice.total}`} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Invoice Currency</label>
              <input className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-500 cursor-not-allowed" readOnly value={invoice.currency} />
            </div>
          </div>

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
              <input type="date" {...register("settlementDate")} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 outline-none focus:ring-1 focus:ring-indigo-500" />
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
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Deductions/Fees (optional)</label>
              <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded focus-within:ring-1 focus-within:ring-indigo-500 overflow-hidden">
                <span className="px-3 text-neutral-500 border-r border-neutral-800 bg-neutral-900">₹</span>
                <input type="number" step="0.01" {...register("deductions")} placeholder="1650" className="w-full p-2 bg-transparent outline-none" />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Notes (optional)</label>
              <textarea {...register("notes")} placeholder="Wise transfer after FX deduction." className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 outline-none focus:ring-1 focus:ring-indigo-500 resize-none h-10" />
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 font-mono text-sm">
            <div className="flex justify-between text-neutral-400">
              <span>Expected INR:</span>
              <span>₹{expectedINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-neutral-400 mt-1">
              <span>Actual INR:</span>
              <span>₹{actualInrReceived.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-800 pt-2 mt-2 font-bold" style={{ color: settlementGap > 0 ? '#f87171' : (settlementGap < 0 ? '#34d399' : '#a3a3a3') }}>
              <span>Settlement Gap:</span>
              <span>
                ₹{Math.abs(settlementGap).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {settlementGap > 0 ? ' (loss)' : (settlementGap < 0 ? ' (gain)' : '')}
              </span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border border-neutral-700 rounded-md hover:bg-neutral-800 transition-colors">Cancel</button>
            <button type="button" onClick={handleSubmit(onSubmit)} className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors text-white font-medium">Save Settlement</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
