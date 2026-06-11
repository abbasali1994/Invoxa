import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Decimal from "decimal.js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const expenseSchema = z.object({
  vendor: z.string().min(1, "Vendor name is required"),
  expenseNumber: z.string().nullish(),
  date: z.string(),
  category: z.string().min(1, "Category is required"),
  currency: z.string().min(1, "Currency is required"),
  accountId: z.string().nullish(),
  notes: z.string().nullish(),
  isRecurring: z.boolean().default(false),
  lineItems: z.array(z.object({
    description: z.string().min(1, "Required"),
    hours: z.number().nullish(),
    cost: z.number().nullish(),
    amount: z.number().nullish(),
    isSection: z.boolean().default(false)
  })).min(1, "At least one item required"),
  taxRate: z.number().nullish().transform(v => v ?? 0),
  paymentMethod: z.string().nullish(),
  paidFromAccountId: z.string().nullish(),
  receiptUrl: z.string().nullish(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export function useExpenseForm(initialData?: any, isEdit = false) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [uploadedReceiptUrl, setUploadedReceiptUrl] = useState<string | null>(null);
  const [uploadedReceiptType, setUploadedReceiptType] = useState<string | null>(null);

  const defaultValues = initialData ? {
    ...initialData,
    date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    lineItems: Array.isArray(initialData.lineItems) && initialData.lineItems.length > 0 
      ? initialData.lineItems 
      : [{ description: initialData.category || "Expense Item", hours: 1, cost: initialData.amount || 0, amount: initialData.amount || 0, isSection: false }],
    taxRate: initialData.taxRate ?? 0,
    isRecurring: initialData.isRecurring ?? false,
    currency: initialData.currency || "INR",
    category: initialData.category || "",
    vendor: initialData.vendor || "",
    receiptUrl: initialData.receiptUrl || "",
  } : {
    vendor: "",
    expenseNumber: "",
    date: new Date().toISOString().split('T')[0],
    category: "",
    currency: "INR",
    isRecurring: false,
    taxRate: 0,
    lineItems: [{ description: "", hours: 1, cost: 0, amount: 0, isSection: false }],
    receiptUrl: "",
  };

  const methods = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema as any),
    defaultValues
  });

  const { watch, reset, getValues } = methods;
  const watchLineItems = watch("lineItems") || [];

  const subtotal = watchLineItems.reduce((sum: number, item: any) => {
    if (item.isSection) return sum;
    return new Decimal(sum).plus(item.amount || 0).toNumber();
  }, 0);

  const total = subtotal;

  useEffect(() => {
    fetch('/api/accounts').then(res => res.json()).then(data => { if(Array.isArray(data)) setAccounts(data); }).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!initialData?.id) return;
    const key = `receipt_preview_${initialData.id}`;
    const stored = sessionStorage.getItem(key);
    if (!stored) return;
    try {
      const { url, type } = JSON.parse(stored);
      setUploadedReceiptUrl(url);
      setUploadedReceiptType(type);
      sessionStorage.removeItem(key);
    } catch {}
  }, [initialData?.id]);

  useEffect(() => {
    if (isEdit || initialData) return;

    const dupDataStr = sessionStorage.getItem('duplicate_expense_data');
    if (dupDataStr) {
      try {
        const data = JSON.parse(dupDataStr);
        reset({
          vendor: data.vendor || "",
          expenseNumber: "",
          date: new Date().toISOString().split('T')[0],
          category: data.category || "",
          currency: data.currency || "INR",
          accountId: data.accountId || "",
          notes: data.notes || "",
          isRecurring: data.isRecurring || false,
          taxRate: data.taxRate || 0,
          paymentMethod: data.paymentMethod || "",
          paidFromAccountId: data.paidFromAccountId || "",
          lineItems: Array.isArray(data.lineItems) && data.lineItems.length > 0 ? data.lineItems : [{ description: "", hours: 1, cost: 0, amount: 0, isSection: false }],
        });
      } catch (e) {
        console.error("Failed to parse duplicate expense data", e);
      } finally {
        sessionStorage.removeItem('duplicate_expense_data');
      }
      return;
    }

    const aiDataStr = sessionStorage.getItem('ai_expense_data');
    if (aiDataStr) {
      try {
        const aiData = JSON.parse(aiDataStr);
        const amount = parseFloat(aiData.amount) || 0;
        reset({
          ...getValues(),
          vendor: aiData.vendor || "",
          date: aiData.date || new Date().toISOString().split('T')[0],
          category: aiData.category || "",
          lineItems: [{
            description: aiData.category || "Expense Item",
            hours: 1,
            cost: amount,
            amount: amount,
            isSection: false
          }]
        });
      } catch (e) {
        console.error("Failed to parse AI data", e);
      } finally {
        sessionStorage.removeItem('ai_expense_data');
      }
    }

    if (!isEdit && !initialData?.expenseNumber) {
      fetch('/api/expenses/counts').then(res => res.json()).then(data => {
        if (data.nextNumber) methods.setValue("expenseNumber", data.nextNumber);
      }).catch(() => {});
    }
  }, [isEdit, initialData, reset, getValues]);

  const onSubmit = async (data: ExpenseFormValues, status: 'SAVED' | 'DRAFT' = 'SAVED') => {
    setIsSaving(true);
    try {
      const payload = { ...data, amount: total, subtotal, total, status };
      const url = isEdit ? `/api/expenses/${initialData.id}` : '/api/expenses';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed to save expense");
      const saved = await res.json();
      
      if (status === 'DRAFT') {
        toast.success(isEdit ? "Draft updated" : "Draft saved");
        router.push('/expenses');
      } else {
        toast.success(isEdit ? "Expense updated" : "Expense saved successfully");
        router.push(`/expenses/${saved.id}`);
      }
    } catch (error) {
      toast.error("Failed to save expense");
    } finally {
      setIsSaving(false);
    }
  };

  const previewData = {
    ...watch(),
    subtotal,
    total,
    amount: total,
    account: accounts.find(a => a.id === watch('accountId')),
    receiptUrl: uploadedReceiptUrl || watch('receiptUrl'),
    receiptMimeType: uploadedReceiptType,
  };

  return { methods, onSubmit, isSaving, accounts, subtotal, total, previewData };
}
