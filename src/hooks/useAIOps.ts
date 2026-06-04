import { useState } from "react";
import { toast } from "sonner";

export function useAIOps() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [aiData, setAiData] = useState<any>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      toast.info("Starting local OCR with Tesseract...");
      
      const Tesseract = (await import('tesseract.js')).default;
      const result = await Tesseract.recognize(file, 'eng');
      setExtractedText(result.data.text);
      
      toast.success("OCR Complete. Sending to Claude for structuring...");

      const res = await fetch('/api/ai/extract-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: result.data.text })
      });

      if (!res.ok) throw new Error("AI Extraction failed");
      
      const structured = await res.json();
      setAiData(structured);
      toast.success("AI Structured data ready");

    } catch (error) {
      console.error(error);
      toast.error("Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveExpense = async () => {
    if (!aiData) return;
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor: aiData.vendor,
          amount: parseFloat(aiData.amount),
          date: aiData.date,
          category: aiData.category,
          aiCategorized: true
        })
      });

      const data = await res.json();
      if (data.duplicateWarning) {
        toast.warning("Duplicate detected! Please review.");
      } else {
        toast.success("Expense saved to ledger");
      }
      setAiData(null);
      setExtractedText("");
    } catch (e) {
      toast.error("Failed to save expense");
    }
  };

  return {
    isProcessing,
    extractedText,
    aiData,
    setAiData,
    handleFileUpload,
    saveExpense
  };
}
