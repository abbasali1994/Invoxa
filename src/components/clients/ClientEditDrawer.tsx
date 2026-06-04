import React from "react";

export function ClientEditDrawer({ formData, setFormData, isEditOpen, setIsEditOpen, handleSaveEdit }: any) {
  if (!isEditOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-[400px] bg-neutral-900 h-full border-l border-neutral-800 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Edit Client</h3>
          <button onClick={() => setIsEditOpen(false)} className="text-neutral-400 hover:text-white transition-colors">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-300 block mb-1">Name</label>
            <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors" />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-300 block mb-1">Email</label>
            <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors" />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-300 block mb-1">Country</label>
            <input type="text" value={formData.country || ''} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-300 block mb-1">Currency</label>
              <select value={formData.currency || 'USD'} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="INR">INR</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-300 block mb-1">Terms</label>
              <input type="text" value={formData.preferredTerms || ''} placeholder="Net 30" onChange={e => setFormData({...formData, preferredTerms: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors" />
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-neutral-800">
            <h4 className="text-sm font-medium text-white mb-4">Payment Details</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1">Payment Method</label>
                <select value={formData.paymentMethod || ''} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors">
                  <option value="">Select Method...</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Crypto">Crypto</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Wise">Wise</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1">Bank Name</label>
                <input type="text" value={formData.bankName || ''} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1">Account Name</label>
                <input type="text" value={formData.bankAccountName || ''} onChange={e => setFormData({...formData, bankAccountName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1">Account Number</label>
                <input type="text" value={formData.accountNumber || ''} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-neutral-800 bg-neutral-950">
          <button onClick={handleSaveEdit} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-md font-medium text-white shadow-lg shadow-indigo-900/20">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
