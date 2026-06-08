import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useExpenseUpload() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      sessionStorage.setItem('ai_expense_data', JSON.stringify(structured));
      
      toast.success("Data ready! Redirecting...");
      router.push('/expenses/new');
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
