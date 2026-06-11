import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useExpenseUpload() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local blob URL so the edit page can show the original file
    // without needing server-side storage (not available on Vercel).
    const blobUrl = URL.createObjectURL(file);

    try {
      setIsProcessing(true);
      toast.info("Scanning document...");

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ai/extract-receipt', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error("AI Extraction failed");

      const structured = await res.json();

      const expenseRes = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...structured,
          amount: structured.amount || 0,
          currency: structured.currency || "USD",
          total: structured.amount || 0,
          subtotal: structured.amount || 0,
          lineItems: [{
            description: structured.category || "Expense Item",
            hours: 1,
            cost: structured.amount || 0,
            amount: structured.amount || 0,
            isSection: false
          }],
          status: 'SAVED'
        })
      });

      if (!expenseRes.ok) throw new Error("Failed to auto-create expense");
      const newExpense = await expenseRes.json();

      sessionStorage.setItem(
        `receipt_preview_${newExpense.id}`,
        JSON.stringify({ url: blobUrl, type: file.type })
      );

      toast.success("Expense auto-created! Redirecting...");
      router.push(`/expenses/${newExpense.id}/edit`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to process document");
    } finally {
      setIsProcessing(false);
      e.target.value = ''; // Reset input
    }
  };

  return {
    isProcessing,
    handleFileUpload
  };
}
