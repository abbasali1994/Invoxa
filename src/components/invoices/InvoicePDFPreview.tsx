import React from 'react';
import { FileText, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { InvoicePDFDocument } from "@/components/InvoicePDFDocument";

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-neutral-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading PDF engine...</div>
});

export function InvoicePDFPreview({ invoice }: { invoice: any }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex-col overflow-hidden h-[600px] flex">
      <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
        <h3 className="text-sm font-medium flex items-center text-neutral-300">
          <FileText className="w-4 h-4 mr-2" /> Live PDF Preview
        </h3>
      </div>
      <div className="flex-1 w-full h-full bg-neutral-900">
        <PDFViewer width="100%" height="100%" className="border-0">
          <InvoicePDFDocument 
            data={invoice} 
            clientName={invoice.client.name} 
          />
        </PDFViewer>
      </div>
    </div>
  );
}
