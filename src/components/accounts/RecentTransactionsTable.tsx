import React from "react";

export function RecentTransactionsTable() {
  return (
    <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/50">
      <div className="p-5 border-b border-neutral-800">
        <h3 className="font-medium text-neutral-200">Recent Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-950/30 text-neutral-500">
            <tr>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Account</th>
              <th className="px-5 py-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 text-neutral-300">
            <tr className="hover:bg-neutral-800/20 transition-colors">
              <td className="px-5 py-4">Oct 24, 2024</td>
              <td className="px-5 py-4">Invoice INV-2024-0012 Settlement</td>
              <td className="px-5 py-4"><span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-xs">Wise Business</span></td>
              <td className="px-5 py-4 text-right text-emerald-400">+$12,500.00</td>
            </tr>
            <tr className="hover:bg-neutral-800/20 transition-colors">
              <td className="px-5 py-4">Oct 22, 2024</td>
              <td className="px-5 py-4">Software Subscription (AWS)</td>
              <td className="px-5 py-4"><span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md text-xs">Mercury USD</span></td>
              <td className="px-5 py-4 text-right">- $450.00</td>
            </tr>
            <tr className="hover:bg-neutral-800/20 transition-colors">
              <td className="px-5 py-4">Oct 20, 2024</td>
              <td className="px-5 py-4">Client Retainer - Globex</td>
              <td className="px-5 py-4"><span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md text-xs">USDC Treasury</span></td>
              <td className="px-5 py-4 text-right text-emerald-400">+$10,000.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
