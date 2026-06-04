import React from "react";
import { format, differenceInDays } from "date-fns";
import Link from "next/link";
import { CalendarClock, AlertCircle } from "lucide-react";

export function ClientUpcomingTab({ client }: { client: any }) {
  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
          <CalendarClock className="w-5 h-5 mr-2 text-indigo-400" /> Scheduled Invoices
        </h3>
        {client.recurringWorkflows?.length > 0 ? (
          <div className="space-y-3">
            {client.recurringWorkflows.map((wf: any) => (
              <div key={wf.id} className="p-4 border border-neutral-800 rounded-lg bg-neutral-900/30 flex justify-between items-center">
                <div>
                  <p className="font-medium text-white">{wf.name}</p>
                  <p className="text-sm text-neutral-400 mt-1">Next run: {format(new Date(wf.nextRunAt), 'MMM d, yyyy')} ({wf.frequency})</p>
                </div>
                <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full border border-indigo-500/20">Active</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-500 border border-neutral-800 rounded-lg bg-neutral-900/10 border-dashed">
            No recurring invoices scheduled.
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-rose-400" /> Pending & Overdue
        </h3>
        {client.upcomingInvoices?.length > 0 ? (
          <div className="space-y-3">
            {client.upcomingInvoices.map((inv: any) => {
              const isOverdue = inv.status === 'OVERDUE' || (inv.dueDate && new Date(inv.dueDate) < new Date());
              const days = inv.dueDate ? Math.abs(differenceInDays(new Date(inv.dueDate), new Date())) : 0;
              return (
                <div key={inv.id} className={`p-4 border rounded-lg flex justify-between items-center ${isOverdue ? 'border-rose-900/50 bg-rose-950/10' : 'border-neutral-800 bg-neutral-900/30'}`}>
                  <div>
                    <p className="font-medium text-white">{inv.invoiceNumber} <span className="text-neutral-400 font-normal ml-2">${inv.total.toLocaleString()}</span></p>
                    <p className={`text-sm mt-1 font-medium ${isOverdue ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isOverdue ? `${days} days overdue` : `Due in ${days} days`}
                    </p>
                  </div>
                  <Link href={`/invoices/${inv.id}`} className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-xs font-medium transition-colors text-white">
                    Pay Now
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-500 border border-neutral-800 rounded-lg bg-neutral-900/10 border-dashed">
            All invoices are fully paid.
          </div>
        )}
      </div>
    </div>
  );
}
