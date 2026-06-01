'use client'
import { useState, useEffect } from 'react'
import { Sun, Moon, Plus, Trash2, Calendar, RefreshCcw } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

const TABS = ['General', 'Payments', 'Scheduler'] as const
type Tab = typeof TABS[number]

const DEFAULT_PAYMENT_METHODS = [
  { id: 'wise', name: 'Wise', type: 'Digital Wallet', builtin: true },
  { id: 'bank', name: 'Bank Transfer', type: 'Bank Transfer', builtin: true },
  { id: 'paypal', name: 'PayPal', type: 'Digital Wallet', builtin: true },
  { id: 'crypto', name: 'Crypto', type: 'Crypto', builtin: true },
  { id: 'stripe', name: 'Stripe', type: 'Digital Wallet', builtin: true },
  { id: 'upi', name: 'UPI', type: 'Digital Wallet', builtin: true },
]

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const defaultTab = (searchParams.get('tab') as Tab) ?? 'General'
  const [activeTab, setActiveTab] = useState<Tab>(TABS.includes(defaultTab as Tab) ? defaultTab as Tab : 'General')
  const [darkMode, setDarkMode] = useState(true)
  const [currency, setCurrency] = useState('USD')
  const [secondaryCurrency, setSecondaryCurrency] = useState('INR')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [timezone, setTimezone] = useState('Asia/Kolkata')

  const [paymentMethods, setPaymentMethods] = useState<any[]>([...DEFAULT_PAYMENT_METHODS])
  const [showAddMethod, setShowAddMethod] = useState(false)
  const [newMethod, setNewMethod] = useState({ name: '', type: 'Bank Transfer', instructions: '' })

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('invoxa_settings')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.darkMode !== undefined) setDarkMode(parsed.darkMode)
        if (parsed.currency) setCurrency(parsed.currency)
        if (parsed.secondaryCurrency) setSecondaryCurrency(parsed.secondaryCurrency)
        if (parsed.dateFormat) setDateFormat(parsed.dateFormat)
        if (parsed.timezone) setTimezone(parsed.timezone)
      } catch {}
    }

    const storedMethods = localStorage.getItem('invoxa_payment_methods')
    if (storedMethods) {
      try { setPaymentMethods(JSON.parse(storedMethods)) } catch {}
    }
  }, [])

  const saveGeneral = () => {
    localStorage.setItem('invoxa_settings', JSON.stringify({ darkMode, currency, secondaryCurrency, dateFormat, timezone }))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    toast.success('Settings saved')
  }

  const addPaymentMethod = () => {
    if (!newMethod.name.trim()) return
    const updated = [...paymentMethods, { ...newMethod, id: `custom-${Date.now()}`, builtin: false }]
    setPaymentMethods(updated)
    localStorage.setItem('invoxa_payment_methods', JSON.stringify(updated))
    setNewMethod({ name: '', type: 'Bank Transfer', instructions: '' })
    setShowAddMethod(false)
    toast.success('Payment method added')
  }

  const removePaymentMethod = (id: string) => {
    const updated = paymentMethods.filter((m) => m.id !== id)
    setPaymentMethods(updated)
    localStorage.setItem('invoxa_payment_methods', JSON.stringify(updated))
    toast.success('Removed')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-neutral-400">Configure your platform preferences.</p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col min-h-[500px]">
        {/* Tab Bar */}
        <div className="flex border-b border-neutral-800 px-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8">
          {/* ── GENERAL TAB ── */}
          {activeTab === 'General' && (
            <div className="max-w-xl space-y-8">
              <div>
                <h4 className="text-sm font-semibold text-neutral-300 mb-4 uppercase tracking-wider">Appearance</h4>
                <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-800">
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Toggle between light and dark mode</p>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      darkMode ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-900'
                    }`}
                  >
                    {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    {darkMode ? 'Dark' : 'Light'}
                  </button>
                </div>
              </div>

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
          )}

          {/* ── PAYMENTS TAB ── */}
          {activeTab === 'Payments' && (
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
                {paymentMethods.map((m) => (
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
          )}

          {/* ── SCHEDULER TAB ── */}
          {activeTab === 'Scheduler' && (
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
          )}
        </div>
      </div>
    </div>
  )
}
