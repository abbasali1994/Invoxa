import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Decimal from "decimal.js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const expenseSchema = z.object({
  vendor: z.string().min(1, "Vendor name is required"),
  expenseNumber: z.string().optional(),
  date: z.string(),
  category: z.string().min(1, "Category is required"),
  currency: z.string().min(1, "Currency is required"),
  accountId: z.string().optional(),
  projectId: z.string().optional(),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  lineItems: z.array(z.object({
    description: z.string().min(1, "Required"),
    hours: z.number().optional(),
    cost: z.number().optional(),
    amount: z.number().optional(),
    isSection: z.boolean().default(false)
  })).min(1, "At least one item required"),
  taxRate: z.number().optional().default(0),
  paymentMethod: z.string().optional(),
  paidFromAccountId: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export function useExpenseForm(initialData?: any, isEdit = false) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const methods = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema as any),
    defaultValues: initialData || {
      vendor: "",
      expenseNumber: `EXP-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString().split('T')[0],
      category: "",
      currency: "USD",
      isRecurring: false,
      taxRate: 0,
      lineItems: [{ description: "", hours: 1, cost: 0, amount: 0, isSection: false }]
    }
  });

  const { watch } = methods;
  const watchLineItems = watch("lineItems") || [];
  const taxRate = watch("taxRate") || 0;

  const subtotal = watchLineItems.reduce((sum: number, item: any) => {
    if (item.isSection) return sum;
    return new Decimal(sum).plus(new Decimal(item.hours || 0).times(item.cost || 0)).toNumber();
  }, 0);

  const total = new Decimal(subtotal).times(1 + (taxRate / 100)).toNumber();

  useEffect(() => {
    fetch('/api/accounts').then(res => res.json()).then(data => { if(Array.isArray(data)) setAccounts(data); }).catch(()=>{});
    fetch('/api/projects').then(res => res.json()).then(data => { if(Array.isArray(data)) setProjects(data); }).catch(()=>{});
  }, []);

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

  const previewData = { ...watch(), subtotal, total, amount: total, account: accounts.find(a => a.id === watch('accountId')) };

  return { methods, onSubmit, isSaving, accounts, projects, subtotal, total, previewData };
}
