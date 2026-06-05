import React from "react";
import { Scan, Loader2, UploadCloud } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";

export function ReceiptOCRPanel({ isProcessing, aiData, setAiData, handleFileUpload, saveExpense }: any) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
      <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Scan className="w-5 h-5 text-indigo-400" />
          Receipt & Bill OCR
        </h3>
      </div>
      
      <div className="p-6 flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 m-6 rounded-lg bg-neutral-950 hover:border-indigo-500 transition-colors relative">
        <input 
          type="file" 
          accept="image/*,application/pdf"
          onChange={handleFileUpload} 
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        {isProcessing ? (
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        ) : (
          <UploadCloud className="w-10 h-10 text-neutral-500 mb-4" />
        )}
        <p className="text-sm text-neutral-300 font-medium">
          {isProcessing ? "Processing..." : "Click or drag & drop receipts here"}
        </p>
        <p className="text-xs text-neutral-500 mt-2">Supports PDF, PNG, JPG (Tesseract.js)</p>
      </div>

      {aiData && (
        <div className="p-6 border-t border-neutral-800 bg-neutral-950">
          <h4 className="text-sm font-medium mb-4 text-emerald-400">Extraction Successful</h4>
          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-500">Vendor</label>
                <input type="text" value={aiData.vendor} onChange={(e) => setAiData({...aiData, vendor: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Amount</label>
                <input type="text" value={aiData.amount} onChange={(e) => setAiData({...aiData, amount: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1 text-sm mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-500">Date</label>
                <DatePicker value={aiData.date} onChange={(e) => setAiData({...aiData, date: e.target.value})} className="mt-1 bg-neutral-900 py-1" />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Category</label>
                <input type="text" value={aiData.category} onChange={(e) => setAiData({...aiData, category: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1 text-sm mt-1" />
              </div>
            </div>
          </div>
          <button onClick={saveExpense} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded transition-colors text-sm">
            Confirm & Save Expense
          </button>
        </div>
      )}
    </div>
  );
}
