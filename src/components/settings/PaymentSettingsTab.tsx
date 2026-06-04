import React from "react";
import { Plus, Trash2 } from "lucide-react";

export function PaymentSettingsTab({ 
  paymentMethods, showAddMethod, setShowAddMethod, newMethod, setNewMethod, 
  addPaymentMethod, removePaymentMethod 
}: any) {
  return (
    <div className="max-w-xl space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-semibold text-neutral-300">Payment Methods</h4>
          <p className="text-xs text-neutral-500 mt-0.5">These appear in the settlement recording modal</p>
        </div>
        <button
          onClick={() => setShowAddMethod(!showAddMethod)}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 rounded-md text-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Method
        </button>
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
            className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm outline-none"
          >
            <option>Bank Transfer</option>
            <option>Digital Wallet</option>
            <option>Crypto</option>
            <option>Other</option>
          </select>
          <textarea
            placeholder="Instructions (e.g. Send to HDFC account ending 1234)"
            value={newMethod.instructions}
            onChange={(e) => setNewMethod({ ...newMethod, instructions: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm outline-none resize-none h-16"
          />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowAddMethod(false)} className="px-4 py-1.5 border border-neutral-700 rounded text-sm hover:bg-neutral-800 transition-colors">Cancel</button>
            <button onClick={addPaymentMethod} className="px-4 py-1.5 bg-indigo-600 rounded text-sm hover:bg-indigo-700 transition-colors">Save</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {paymentMethods.map((m: any) => (
          <div key={m.id} className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
            <div>
              <p className="text-sm font-medium">{m.name}</p>
              <p className="text-xs text-neutral-500">{m.type}</p>
              {m.instructions && <p className="text-xs text-neutral-600 mt-0.5">{m.instructions}</p>}
            </div>
            <div className="flex items-center gap-3">
              {m.builtin ? (
                <span className="text-xs text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded">Built-in</span>
              ) : (
                <button onClick={() => removePaymentMethod(m.id)} className="text-neutral-600 hover:text-rose-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
