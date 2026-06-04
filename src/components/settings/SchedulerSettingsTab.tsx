import React from "react";
import { Plus, Calendar, RefreshCcw } from "lucide-react";

export function SchedulerSettingsTab() {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-semibold text-neutral-300">Recurring Workflows</h4>
          <p className="text-xs text-neutral-500 mt-0.5">Automated invoices, reminders, and schedules</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-md text-sm hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> New Workflow
        </button>
      </div>

      <div className="flex gap-6">
        <div className="w-1/3 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Schedule</h3>
            <Calendar className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="aspect-square bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center text-neutral-600 text-sm">
            <RefreshCcw className="w-8 h-8 opacity-30" />
          </div>
        </div>

        <div className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-900 text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3 font-medium">Workflow</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Frequency</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="py-12 text-center text-neutral-600">
                  <RefreshCcw className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No active recurring workflows.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
