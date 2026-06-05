"use client";

import { FormProvider } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { InvoiceMetaForm } from "@/components/invoices/InvoiceMetaForm";
import { LineItemsTable } from "@/components/invoices/LineItemsTable";
import { PaymentDetailsForm } from "@/components/invoices/PaymentDetailsForm";
import { InvoicePDFPreview } from "@/components/invoices/InvoicePDFPreview";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";

export function InvoiceForm({ initialData, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
  const initialClientId = useSearchParams().get('clientId') || '';
  const { methods, onSubmit, isSaving, lastSaved, clients } = useInvoiceForm(initialData, isEdit, initialClientId);
  const { handleSubmit, watch } = methods;

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Invoice' : 'Create Invoice'}</h2>
            <p className="text-neutral-400">
              {lastSaved ? `Draft saved at ${lastSaved.toLocaleTimeString()}` : "Generate a new AI-assisted invoice."}
            </p>
          </div>
          <div className="flex gap-3 sm:shrink-0">
            <button 
              type="button"
              onClick={handleSubmit((d) => onSubmit(d, 'DRAFT'))}
              disabled={isSaving}
              className="px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button 
              type="button"
              onClick={handleSubmit((d) => onSubmit(d, 'SENT'))}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSaving ? "Saving..." : (isEdit ? "Update Invoice" : "Create Invoice")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-6 overflow-hidden">
            <InvoiceMetaForm clients={clients} />
            <LineItemsTable />
            <PaymentDetailsForm />
          </div>

          <div className="hidden lg:block">
            <InvoicePDFPreview invoice={{ ...watch(), billToCompany: watch("clientName"), client: { name: watch("clientName") } }} />
          </div>
        </div>
      </div>
    </FormProvider>
  );
}




