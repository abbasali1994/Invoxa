import React from "react";

export function SettlementStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <p className="text-sm text-neutral-400 mb-1">Total Invoiced (USD)</p>
        <p className="text-2xl font-bold">${stats.totalInvoicedUSD?.toLocaleString() || '0.00'}</p>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <p className="text-sm text-neutral-400 mb-1">Total Realized (INR)</p>
        <p className="text-2xl font-bold text-emerald-400">₹{stats.realizedINR?.toLocaleString('en-IN') || '0'}</p>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <p className="text-sm text-neutral-400 mb-1">Total Settlement Gap</p>
        <p className={`text-2xl font-bold ${stats.totalSettlementGap > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
          ₹{Math.abs(stats.totalSettlementGap || 0).toLocaleString('en-IN')}
          {stats.totalSettlementGap > 0 ? ' (Loss)' : (stats.totalSettlementGap < 0 ? ' (Gain)' : '')}
        </p>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <p className="text-sm text-neutral-400 mb-1">Pending Settlements</p>
        <p className="text-2xl font-bold">{stats.pendingSettlementsCount || 0}</p>
        <p className="text-xs text-neutral-500 mt-1">${stats.pendingSettlementsUSD?.toLocaleString() || '0'} USD</p>
      </div>
    </div>
  );
}
