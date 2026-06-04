import React from 'react';
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { RecordSettlementModal } from "@/components/RecordSettlementModal";

export function SettlementTimeline({ invoice, fetchInvoice }: { invoice: any, fetchInvoice: () => void }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="text-lg font-medium border-b border-neutral-800 pb-4 mb-4">Settlement Timeline</h3>
      
      {(!invoice.settlements || invoice.settlements.length === 0) && (
        <p className="text-sm text-neutral-500 mb-4">No settlements recorded yet.</p>
      )}
      
      {invoice.settlements && invoice.settlements.length > 0 && (
        <div className="space-y-4 mb-6">
          {invoice.settlements.map((settlement: any, i: number) => (
            <div key={settlement.id} className="text-sm border-b border-neutral-800 pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-neutral-300">Settlement {i + 1}</span>
                <span className="text-xs text-neutral-500">{format(new Date(settlement.settledAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-neutral-400">
                <div><span>₹{settlement.actualInrReceived?.toLocaleString('en-IN') || 0}</span></div>
                <div className="text-right"><span>{settlement.paymentMethod}</span></div>
              </div>
            </div>
          ))}
          
          <div className="pt-3 border-t border-neutral-700">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-neutral-300">Total Received:</span>
              <span className="font-bold text-emerald-400">
                ₹{invoice.settlements.reduce((sum: number, s: any) => sum + (s.actualInrReceived || 0), 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-xs text-neutral-500 text-right mt-1">
              Expected: ₹{(invoice.total * (invoice.settlements[0]?.exchangeRate || 83.5)).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}
      
      {invoice.status !== 'CANCELLED' && (
        <RecordSettlementModal invoice={invoice} onSaved={fetchInvoice}>
          <button className="w-full flex justify-center items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
            Record Settlement <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </RecordSettlementModal>
      )}
    </div>
  );
}
