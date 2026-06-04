import React from "react";

export function SettlementSummary({ expectedINR, actualInrReceived, settlementGap }: any) {
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 font-mono text-sm">
      <div className="flex justify-between text-neutral-400">
        <span>Expected INR:</span>
        <span>₹{expectedINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <div className="flex justify-between text-neutral-400 mt-1">
        <span>Actual INR:</span>
        <span>₹{actualInrReceived.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <div className="flex justify-between border-t border-neutral-800 pt-2 mt-2 font-bold" style={{ color: settlementGap > 0 ? '#f87171' : (settlementGap < 0 ? '#34d399' : '#a3a3a3') }}>
        <span>Settlement Gap:</span>
        <span>
          ₹{Math.abs(settlementGap).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          {settlementGap > 0 ? ' (loss)' : (settlementGap < 0 ? ' (gain)' : '')}
        </span>
      </div>
    </div>
  );
}
