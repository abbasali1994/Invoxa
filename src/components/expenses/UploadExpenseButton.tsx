import React, { useRef } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { useExpenseUpload } from "@/hooks/useExpenseUpload";

export function UploadExpenseButton() {
  const { isProcessing, handleFileUpload } = useExpenseUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
        className="hidden"
        ref={fileInputRef}
        disabled={isProcessing}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="flex items-center px-4 py-2 border border-neutral-700 bg-neutral-900 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-400" />
        ) : (
          <UploadCloud className="w-4 h-4 mr-2 text-indigo-400" />
        )}
        {isProcessing ? "Scanning..." : "Upload Expense"}
      </button>
    </>
  );
}
