import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export function PaymentSettingsTab({ 
  paymentMethods, showAddMethod, setShowAddMethod, newMethod, setNewMethod, 
  addPaymentMethod, removePaymentMethod 
}: any) {
  const [isCustomType, setIsCustomType] = useState(false);
  const uniqueTypes = Array.from(new Set(paymentMethods.map((m: any) => m.type)));

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-semibold text-neutral-300">Payment Methods</h4>
          <p className="text-xs text-neutral-500 mt-0.5">These appear in the settlement recording modal</p>
        </div>
      </div>

      {showAddMethod && (
        <div className="p-4 border border-indigo-500/30 bg-indigo-500/5 rounded-lg space-y-3">
          <h5 className="text-sm font-medium text-indigo-300">New Payment Method</h5>
          <input
            type="text"
            placeholder="Name (e.g. HDFC Bank)"
            value={newMethod.name}
            onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <select
            value={newMethod.type}
            onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm outline-none cursor-not-allowed opacity-70"
            disabled
          >
            {uniqueTypes.map(t => <option key={t as string} value={t as string}>{t as string}</option>)}
          </select>

          {newMethod.type === 'Bank Transfer' ? (
            <div className="space-y-3 p-3 bg-neutral-900/30 rounded-lg border border-neutral-800">
              <input type="text" placeholder="Account Name (e.g. John Doe)" value={newMethod.bankAccountName || ''} onChange={e => setNewMethod({...newMethod, bankAccountName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
              <input type="text" placeholder="Account Number" value={newMethod.accountNumber || ''} onChange={e => setNewMethod({...newMethod, accountNumber: e.target.value})} className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
              <input type="text" placeholder="Bank Name (e.g. HDFC Bank)" value={newMethod.bankName || ''} onChange={e => setNewMethod({...newMethod, bankName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
              <input type="text" placeholder="IFSC Code" value={newMethod.ifscCode || ''} onChange={e => setNewMethod({...newMethod, ifscCode: e.target.value})} className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          ) : (
            <textarea
              placeholder="Instructions (e.g. Send to HDFC account ending 1234)"
              value={newMethod.instructions}
              onChange={(e) => setNewMethod({ ...newMethod, instructions: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm outline-none resize-none h-16"
            />
          )}
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setShowAddMethod(false); setIsCustomType(false); }} className="px-4 py-1.5 border border-neutral-700 rounded text-sm hover:bg-neutral-800 transition-colors">Cancel</button>
            <button onClick={addPaymentMethod} className="px-4 py-1.5 bg-indigo-600 rounded text-sm hover:bg-indigo-700 transition-colors">Save</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {uniqueTypes.map((type) => {
          const typeMethods = paymentMethods.filter((m: any) => m.type === type);
          const visibleMethods = typeMethods.filter((m: any) => !(m.builtin && m.name === m.type));
          
          return (
            <div key={type as string} className="border border-neutral-800 rounded-lg overflow-hidden">
              <div className="bg-neutral-900/50 p-3 flex justify-between items-center border-b border-neutral-800">
                <h5 className="font-medium text-sm text-neutral-200">{type as string}</h5>
                <button 
                  onClick={() => { 
                    setShowAddMethod(true); 
                    setIsCustomType(false); 
                    setNewMethod({name: '', type: type as string, instructions: '', bankAccountName: '', accountNumber: '', bankName: '', ifscCode: ''}); 
                  }} 
                  className="p-1 hover:bg-neutral-700 rounded transition-colors text-neutral-400 hover:text-white"
                  title={`Add ${type}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-neutral-800 bg-neutral-950">
                {visibleMethods.length === 0 ? (
                  <div className="p-3 text-xs text-neutral-500 text-center">No accounts added under this category.</div>
                ) : (
                  visibleMethods.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-3">
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        {m.type === 'Bank Transfer' && m.bankAccountName ? (
                          <div className="text-xs text-neutral-400 mt-1 space-y-0.5">
                            <p>{m.bankName} - {m.accountNumber}</p>
                            <p>{m.bankAccountName} | IFSC: {m.ifscCode}</p>
                          </div>
                        ) : m.instructions ? (
                          <p className="text-xs text-neutral-600 mt-0.5">{m.instructions}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3">
                        {m.builtin ? (
                          <span className="text-[10px] uppercase tracking-wider text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded">Built-in</span>
                        ) : (
                          <button onClick={() => removePaymentMethod(m.id)} className="text-neutral-600 hover:text-rose-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
