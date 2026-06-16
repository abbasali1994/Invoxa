'use client'

import { useSettings } from '@/hooks/useSettings'
import { GeneralSettingsTab } from '@/components/settings/GeneralSettingsTab'
import { PaymentSettingsTab } from '@/components/settings/PaymentSettingsTab'

export default function SettingsPage() {
  const settings = useSettings()
  const { activeTab, setActiveTab } = settings

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-neutral-400">Configure your platform preferences.</p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col min-h-[500px]">
        {/* Tab Bar */}
        <div className="flex border-b border-neutral-800 px-4">
          {settings.activeTab && (settings.activeTab === 'General' || settings.activeTab === 'Payments') && ['General', 'Payments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
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
          {activeTab === 'General' && <GeneralSettingsTab {...settings} />}
          {activeTab === 'Payments' && <PaymentSettingsTab {...settings} />}
        </div>
      </div>
    </div>
  )
}
