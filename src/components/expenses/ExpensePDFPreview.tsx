import React from "react";
import dynamic from "next/dynamic";
import { FileText, Loader2 } from "lucide-react";
import { ExpensePDFDocument } from "@/components/ExpensePDFDocument";

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-neutral-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading PDF engine...</div>
});

export function ExpensePDFPreview({ previewData }: { previewData: any }) {
  const hasReceipt = !!previewData?.receiptUrl;
  const isImage = hasReceipt && (
    previewData.receiptMimeType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(previewData.receiptUrl)
  );

  return (
    <div className="hidden lg:flex rounded-xl border border-neutral-800 bg-neutral-900/50 flex-col overflow-hidden h-[900px]">
      <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
        <h3 className="text-sm font-medium flex items-center text-neutral-300">
          <FileText className="w-4 h-4 mr-2" /> {hasReceipt ? "Actual Bill Preview" : "Live PDF Preview"}
        </h3>
      </div>
      <div className="flex-1 w-full h-full bg-neutral-900 overflow-hidden relative">
        {hasReceipt ? (
          isImage ? (
            <img src={previewData.receiptUrl} alt="Bill Preview" className="w-full h-full object-contain" />
          ) : (
            <iframe src={previewData.receiptUrl} className="w-full h-full border-0" />
          )
        ) : (
          <PDFViewer width="100%" height="100%" className="border-0">
            <ExpensePDFDocument expense={previewData} />
          </PDFViewer>
        )}
      </div>
    </div>
  );
}
