'use client'

import { Suspense } from 'react'
import { useSettings, TABS } from '@/hooks/useSettings'
import { GeneralSettingsTab } from '@/components/settings/GeneralSettingsTab'
import { PaymentSettingsTab } from '@/components/settings/PaymentSettingsTab'
import { TeamSettingsTab } from '@/components/settings/TeamSettingsTab'

function SettingsContent() {
  const settings = useSettings()
  const { activeTab, setActiveTab } = settings

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-neutral-400">Configure your platform preferences.</p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col min-h-[500px]">
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
          {activeTab === 'General' && <GeneralSettingsTab {...settings} />}
          {activeTab === 'Payments' && <PaymentSettingsTab {...settings} />}
          {activeTab === 'Team' && <TeamSettingsTab />}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  )
}
