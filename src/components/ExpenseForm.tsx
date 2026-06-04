"use client";

import { FormProvider } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useExpenseForm } from "@/hooks/useExpenseForm";
import { ExpenseMetaForm } from "@/components/expenses/ExpenseMetaForm";
import { ExpenseLineItemsTable } from "@/components/expenses/ExpenseLineItemsTable";
import { ExpensePaymentDetailsForm } from "@/components/expenses/ExpensePaymentDetailsForm";
import { ExpensePDFPreview } from "@/components/expenses/ExpensePDFPreview";

export function ExpenseForm({ initialData, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
  const { methods, onSubmit, isSaving, accounts, projects, subtotal, total, previewData } = useExpenseForm(initialData, isEdit);
  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Expense' : 'Create Expense'}</h2>
            <p className="text-neutral-400">Record a new outgoing payment.</p>
          </div>
          <div className="flex space-x-3">
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
              onClick={handleSubmit((d) => onSubmit(d, 'SAVED'))}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSaving ? "Saving..." : (isEdit ? "Update Expense" : "Save Expense")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-6 overflow-hidden">
            <ExpenseMetaForm accounts={accounts} projects={projects} />
            <ExpenseLineItemsTable subtotal={subtotal} total={total} taxRate={methods.getValues("taxRate") || 0} />
            <ExpensePaymentDetailsForm accounts={accounts} />
          </div>
          <ExpensePDFPreview previewData={previewData} />
        </div>
      </div>
    </FormProvider>
  );
}

