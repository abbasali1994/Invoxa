import React from "react";

export function GeneralSettingsTab({ 
  darkMode, setDarkMode, currency, setCurrency, secondaryCurrency, setSecondaryCurrency, 
  dateFormat, setDateFormat, timezone, setTimezone, saveGeneral 
}: any) {
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h4 className="text-sm font-semibold text-neutral-300 mb-4 uppercase tracking-wider">Currency Preferences</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">Default Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-sm outline-none focus:ring-1 focus:ring-indigo-500">
              {['USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD', 'CAD', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">Secondary Currency</label>
            <select value={secondaryCurrency} onChange={(e) => setSecondaryCurrency(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-sm outline-none focus:ring-1 focus:ring-indigo-500">
              {['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'CAD', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-neutral-300 mb-4 uppercase tracking-wider">Display</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">Date Format</label>
            <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-sm outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-sm outline-none focus:ring-1 focus:ring-indigo-500">
              {['Asia/Kolkata', 'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Dubai', 'Asia/Singapore'].map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button onClick={saveGeneral} className="px-5 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
        Save Settings
      </button>
    </div>
  );
}
