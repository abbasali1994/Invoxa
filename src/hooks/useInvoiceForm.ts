import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Decimal from "decimal.js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const invoiceSchema = z.object({
  clientId: z.string().optional(),
  clientName: z.string().min(1, "Client is required"),
  currency: z.string().default("USD"),
  paymentTerms: z.string().optional(),
  senderName: z.string().default("Abbas Ali Lokhandwala"),
  date: z.string(),
  invoiceNumber: z.string(),
  dueDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  swiftCode: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string().min(1, "Required"),
    hours: z.number().optional(),
    cost: z.number().optional(),
    amount: z.number().optional(),
    isSection: z.boolean().default(false)
  })).min(1, "At least one item required"),
  notes: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export function useInvoiceForm(initialData: any, isEdit: boolean, initialClientId: string) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const methods = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema as any),
    defaultValues: initialData || {
      clientId: initialClientId,
      clientName: "",
      currency: "USD",
      senderName: "Abbas Ali Lokhandwala",
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: "", // Will be fetched if new
      lineItems: [{ description: "", hours: 0, cost: 0, amount: 0, isSection: false }]
    }
  });

  const { watch, setValue, getValues } = methods;
  const watchLineItems = watch("lineItems");
  const watchClientId = watch("clientId");

  useEffect(() => {
    const client = clients.find(c => c.id === watchClientId);
    if (client) {
      setValue("clientName", client.name);
      if (client.paymentMethod) setValue("paymentMethod", client.paymentMethod);
      if (client.bankAccountName) setValue("bankAccountName", client.bankAccountName);
      if (client.bankName) setValue("bankName", client.bankName);
      if (client.accountNumber) setValue("accountNumber", client.accountNumber);
      if (client.ifscCode) setValue("ifscCode", client.ifscCode);
      if (client.swiftCode) setValue("swiftCode", client.swiftCode);
    }
  }, [watchClientId, clients, setValue]);

  const subtotal = watchLineItems?.reduce((sum: number, item: any) => {
    if (item.isSection) return sum;
    return new Decimal(sum).plus(new Decimal(item.hours || 0).times(item.cost || 0)).toNumber();
  }, 0) || 0;

  useEffect(() => {
    fetch('/api/clients').then(res => res.json()).then(data => {
      if(Array.isArray(data)) setClients(data);
    }).catch(() => toast.error("Failed to load clients"));

    if (!isEdit && !initialData?.invoiceNumber) {
      fetch('/api/invoices/counts').then(res => res.json()).then(data => {
        if (data.nextNumber) setValue("invoiceNumber", data.nextNumber);
      }).catch(() => {});
    }
  }, [isEdit, initialData, setValue]);

  useEffect(() => {
    if (initialClientId) setValue('clientId', initialClientId);
  }, [initialClientId, setValue]);

  useEffect(() => {
    if (!initialData?.clientId || !clients.length) return;
    const client = clients.find(c => c.id === initialData.clientId);
    if (client) setValue("clientName", client.name);
  }, [initialData?.clientId, clients, setValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (getValues().clientId) {
        toast.info("Autosaving draft...", { duration: 1000 });
        setLastSaved(new Date());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [getValues]);

  const onSubmit = async (data: InvoiceFormValues, status: 'SENT' | 'DRAFT' = 'SENT') => {
    setIsSaving(true);
    try {
      let clientId = data.clientId;
      const typedClientName = data.clientName.trim();
      const matchedClient = clients.find(c => c.name?.trim().toLowerCase() === typedClientName.toLowerCase());

      if (!clientId && matchedClient) clientId = matchedClient.id;

      if (!clientId) {
        const clientRes = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: typedClientName, currency: data.currency || 'USD' })
        });
        if (!clientRes.ok) throw new Error("Failed to create client");
        clientId = (await clientRes.json()).id;
      }

      const { clientName, ...invoiceData } = data;
      const payload = { ...invoiceData, clientId, billToCompany: typedClientName, subtotal, total: subtotal, status };
      const url = isEdit ? `/api/invoices/${initialData.id}` : '/api/invoices';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed to save invoice");
      
      toast.success(status === 'DRAFT' ? (isEdit ? "Draft updated" : "Draft saved") : (isEdit ? "Invoice updated" : "Invoice created"));
      router.push('/invoices');
      router.refresh();
    } catch (error) {
      toast.error("Failed to save invoice");
    } finally {
      setIsSaving(false);
    }
  };

  return { methods, onSubmit, isSaving, lastSaved, clients };
}
