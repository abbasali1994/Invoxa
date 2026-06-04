"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ExpenseDetailHeader } from "@/components/expenses/ExpenseDetailHeader";
import { ExpenseDetailInfo } from "@/components/expenses/ExpenseDetailInfo";
import { ExpenseLineItemsDisplay } from "@/components/expenses/ExpenseLineItemsDisplay";
import { ExpensePDFPreview } from "@/components/expenses/ExpensePDFPreview";

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/expenses/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setExpense(data);
      })
      .catch(err => toast.error("Failed to load expense"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this expense? This cannot be undone.')) return;
    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      toast.success('Expense deleted');
      router.push('/expenses');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-neutral-500" /></div>;
  if (!expense) return <div className="text-center py-20">Expense not found</div>;

  return (
    <div className="space-y-6">
      <ExpenseDetailHeader expense={expense} id={id} handleDelete={handleDelete} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <ExpenseDetailInfo expense={expense} />
          <ExpenseLineItemsDisplay expense={expense} />
        </div>
        <div className="lg:col-span-2">
          <ExpensePDFPreview previewData={expense} />
        </div>
      </div>
    </div>
  );
}

