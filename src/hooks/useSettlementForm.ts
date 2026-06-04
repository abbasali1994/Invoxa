import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

export function useSettlementForm(invoice: any, onSaved: () => void) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const { register, watch, setValue, handleSubmit, reset } = useForm({
    defaultValues: {
      actualInrReceived: "",
      exchangeRate: 83.5,
      paymentMethod: (invoice?.paymentMethod?.toUpperCase().replace(' ', '_')) || "WISE",
      receivingAccountId: "",
      settlementDate: new Date().toISOString().split('T')[0],
      deductions: "",
      notes: ""
    }
  });

  const [rateStatus, setRateStatus] = useState<"loading" | "live" | "fallback">("loading");

  useEffect(() => {
    if (open && invoice) {
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
  }, [open, setValue, invoice]);

  const actualInrReceived = parseFloat(watch("actualInrReceived") as string) || 0;
  const exchangeRate = watch("exchangeRate") || 0;
  
  const expectedINR = (invoice?.total * exchangeRate) || 0;
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

  return {
    open, setOpen, accounts, register, rateStatus, 
    actualInrReceived, expectedINR, settlementGap, onSubmit: handleSubmit(onSubmit)
  };
}
