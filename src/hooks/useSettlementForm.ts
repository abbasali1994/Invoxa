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

  const settlementDate = watch("settlementDate");
  const [lastFetchedDate, setLastFetchedDate] = useState<string | null>(
    existingSettlement ? toDateInputValue(existingSettlement.settledAt) : null
  );

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

    if (existingSettlement && lastFetchedDate === null) {
      setValue("actualInrReceived", existingSettlement.actualInrReceived || "");
      setValue("exchangeRate", existingSettlement.exchangeRate || 83.5);
      setValue("paymentMethod", existingSettlement.paymentMethod || "WISE");
      setValue("settlementDate", toDateInputValue(existingSettlement.settledAt));
      setValue("notes", existingSettlement.notes || "");
      setRateStatus("fallback");
      setLastFetchedDate(toDateInputValue(existingSettlement.settledAt));
      return;
    }

    if (settlementDate === lastFetchedDate) return;

    const fetchExchangeRate = async () => {
      const currency = invoice.currency || "USD";
      if (currency === "INR") {
        setValue("exchangeRate", 1);
        setRateStatus("live");
        setLastFetchedDate(settlementDate);
        return;
      }

      setRateStatus("loading");
      try {
        const res = await fetch(`https://api.frankfurter.app/${settlementDate}?from=${currency}&to=INR`);
        if (!res.ok) throw new Error("API failed");
        const data = await res.json();
        if (data.rates && data.rates.INR) {
          setValue("exchangeRate", data.rates.INR);
          setRateStatus("live");
        } else {
          throw new Error("No rate returned");
        }
      } catch {
        setValue("exchangeRate", 83.5); // Fallback
        setRateStatus("fallback");
      } finally {
        setLastFetchedDate(settlementDate);
      }
    };

    fetchExchangeRate();
  }, [open, setValue, invoice, existingSettlement, settlementDate, lastFetchedDate]);

  const actualInrReceived = parseFloat(watch("actualInrReceived") as string) || 0;
  const exchangeRate = watch("exchangeRate") || 0;
  const settlementDateValue = watch("settlementDate") || "";

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
    settlementDateValue,
    onSubmit: handleSubmit(onSubmit),
  };
}
