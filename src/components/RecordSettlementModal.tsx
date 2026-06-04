"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSettlementForm } from "@/hooks/useSettlementForm";
import { SettlementInvoiceDetails } from "@/components/settlements/SettlementInvoiceDetails";
import { SettlementFormFields } from "@/components/settlements/SettlementFormFields";
import { SettlementSummary } from "@/components/settlements/SettlementSummary";

export function RecordSettlementModal({ invoice, onSaved, children }: { invoice: any, onSaved: () => void, children: React.ReactNode }) {
  const formState = useSettlementForm(invoice, onSaved);
  const { open, setOpen, onSubmit } = formState;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Settlement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2 text-sm text-neutral-300">
          <SettlementInvoiceDetails invoice={invoice} />
          <SettlementFormFields {...formState} />
          <SettlementSummary {...formState} />
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border border-neutral-700 rounded-md hover:bg-neutral-800 transition-colors">Cancel</button>
            <button type="button" onClick={onSubmit} className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors text-white font-medium">Save Settlement</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

