import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function toDateInputValue(value?: string | Date | null) {
  if (!value) return new Date().toISOString().split("T")[0];
  return new Date(value).toISOString().split("T")[0];
}

export function useSettlementForm(invoice: any, onSaved: () => void, existingSettlement?: any) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const { register, watch, setValue, handleSubmit, reset } = useForm({
    defaultValues: {
      actualInrReceived: existingSettlement?.actualInrReceived ?? "",
      exchangeRate: existingSettlement?.exchangeRate ?? 83.5,
      paymentMethod: existingSettlement?.paymentMethod || (invoice?.paymentMethod?.toUpperCase().replace(" ", "_")) || "WISE",
      receivingAccountId: existingSettlement?.receivingAccountId || "",
      settlementDate: toDateInputValue(existingSettlement?.settledAt),
      notes: existingSettlement?.notes || "",
    },
  });

  const [rateStatus, setRateStatus] = useState<"loading" | "live" | "fallback">("loading");

  useEffect(() => {
    if (!open || !invoice) return;

    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setAccounts(data);
        if (existingSettlement?.receivingAccountId) {
          setValue("receivingAccountId", existingSettlement.receivingAccountId);
        } else if (data.length > 0) {
          setValue("receivingAccountId", data[0].id);
        }
      })
      .catch(() => {});

    if (existingSettlement) {
      setValue("actualInrReceived", existingSettlement.actualInrReceived || "");
      setValue("exchangeRate", existingSettlement.exchangeRate || 83.5);
      setValue("paymentMethod", existingSettlement.paymentMethod || "WISE");
      setValue("settlementDate", toDateInputValue(existingSettlement.settledAt));
      setValue("notes", existingSettlement.notes || "");
      setRateStatus("fallback");
      return;
    }

    const fetchExchangeRate = async () => {
      setRateStatus("loading");
      try {
        const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=INR");
        const data = await res.json();
        setValue("exchangeRate", data.rates.INR);
        setRateStatus("live");
      } catch {
        setValue("exchangeRate", 83.5);
        setRateStatus("fallback");
      }
    };

    fetchExchangeRate();
  }, [open, setValue, invoice, existingSettlement]);

  const actualInrReceived = parseFloat(watch("actualInrReceived") as string) || 0;
  const exchangeRate = watch("exchangeRate") || 0;

  const expectedINR = (invoice?.total * exchangeRate) || 0;
  const settlementGap = expectedINR - actualInrReceived;

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch(existingSettlement ? `/api/settlements/${existingSettlement.id}` : "/api/settlements", {
        method: existingSettlement ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          actualInrReceived: parseFloat(data.actualInrReceived),
          exchangeRate: parseFloat(data.exchangeRate),
          paymentMethod: data.paymentMethod,
          receivingAccountId: data.receivingAccountId,
          settlementDate: data.settlementDate,
          notes: data.notes,
        }),
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
    open,
    setOpen,
    accounts,
    register,
    rateStatus,
    actualInrReceived,
    expectedINR,
    settlementGap,
    onSubmit: handleSubmit(onSubmit),
  };
}
