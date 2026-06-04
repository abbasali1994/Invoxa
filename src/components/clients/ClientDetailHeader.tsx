import React from "react";
import { Edit3, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function ClientDetailHeader({ client, setIsEditOpen }: { client: any, setIsEditOpen: (open: boolean) => void }) {
  const router = useRouter();
  
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-xl font-bold mr-4 shrink-0 shadow-lg">
          {client.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">{client.name}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-400">
            <span><strong className="text-neutral-300">Email:</strong> {client.email || 'N/A'}</span>
            <span><strong className="text-neutral-300">Country:</strong> {client.country || 'N/A'}</span>
            <span><strong className="text-neutral-300">Currency:</strong> {client.currency}</span>
            <span><strong className="text-neutral-300">Terms:</strong> {client.preferredTerms || 'Net 30'}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setIsEditOpen(true)} className="flex items-center px-4 py-2 border border-neutral-700 bg-neutral-900 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors text-white">
          <Edit3 className="w-4 h-4 mr-2" /> Edit Client
        </button>
        <button onClick={() => router.push(`/invoices/new?clientId=${client.id}`)} className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors text-white">
          <Plus className="w-4 h-4 mr-2" /> New Invoice
        </button>
      </div>
    </div>
  );
}
