import React from "react";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { RecordSettlementModal } from "@/components/RecordSettlementModal";

export function SettlementTimeline({ invoice, fetchInvoice }: { invoice: any; fetchInvoice: () => void }) {
  const settlements = invoice.settlements || [];
  const existingSettlement = settlements.length > 0 ? settlements[settlements.length - 1] : null;
  const expectedINR = existingSettlement ? invoice.total * (existingSettlement.exchangeRate || 83.5) : 0;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="text-lg font-medium border-b border-neutral-800 pb-4 mb-4">Settlement Timeline</h3>

      {!existingSettlement && (
        <p className="text-sm text-neutral-500 mb-4">No settlements recorded yet.</p>
      )}

      {existingSettlement && (
        <div className="space-y-4 mb-6">
          <div className="text-sm border-b border-neutral-800 pb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-neutral-300">Settlement</span>
              <span className="text-xs text-neutral-500">{format(new Date(existingSettlement.settledAt), "MMM d, yyyy")}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-neutral-400">
              <div><span>{"\u20b9"}{existingSettlement.actualInrReceived?.toLocaleString("en-IN") || 0}</span></div>
              <div className="text-right"><span>{existingSettlement.paymentMethod}</span></div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-700">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-neutral-300">Total Received:</span>
              <span className="font-bold text-emerald-400">
                {"\u20b9"}{(existingSettlement.actualInrReceived || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="text-xs text-neutral-500 text-right mt-1">
              Expected: {"\u20b9"}{expectedINR.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      )}

      {invoice.status !== "CANCELLED" && (
        <RecordSettlementModal invoice={invoice} existingSettlement={existingSettlement} onSaved={fetchInvoice}>
          <button className="w-full flex justify-center items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
            {existingSettlement ? "Edit Settlement" : "Record Settlement"} <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </RecordSettlementModal>
      )}
    </div>
  );
}
