import React from "react";
import { Building2, Wallet, RefreshCw, CircleDollarSign, ArrowRightLeft } from "lucide-react";

export function AccountCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Bank Account */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-neutral-800 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-200">Mercury USD</h3>
              <p className="text-xs text-neutral-500">Business Checking</p>
            </div>
          </div>
        </div>
        <div className="p-5 flex-1">
          <p className="text-3xl font-bold tracking-tight">$45,000.00</p>
        </div>
        <div className="bg-neutral-950/50 p-3 px-5 border-t border-neutral-800 flex justify-between">
          <button className="text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center">
            View Ledger <ArrowRightLeft className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>

      {/* Wise Account */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-neutral-800 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-200">Wise Business</h3>
              <p className="text-xs text-neutral-500">Multi-Currency</p>
            </div>
          </div>
        </div>
        <div className="p-5 flex-1">
          <p className="text-3xl font-bold tracking-tight">$12,500.00</p>
        </div>
        <div className="bg-neutral-950/50 p-3 px-5 border-t border-neutral-800 flex justify-between">
          <button className="text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center">
            View Ledger <ArrowRightLeft className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>

      {/* Crypto Wallet */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 p-3">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        </div>
        <div className="p-5 border-b border-neutral-800 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-200">USDC Treasury</h3>
              <p className="text-xs text-neutral-500">0x1234...7890</p>
            </div>
          </div>
        </div>
        <div className="p-5 flex-1">
          <p className="text-3xl font-bold tracking-tight">$10,000.00</p>
          <p className="text-xs text-indigo-400 mt-1 flex items-center">
            <CircleDollarSign className="w-3 h-3 mr-1" /> Live from CoinGecko
          </p>
        </div>
        <div className="bg-neutral-950/50 p-3 px-5 border-t border-neutral-800 flex justify-between">
          <button className="text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center">
            View Ledger <ArrowRightLeft className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
