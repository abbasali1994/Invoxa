import React from 'react';

export interface InvoiceTabBarProps {
  counts: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function InvoiceTabBar({ counts, activeTab, setActiveTab }: InvoiceTabBarProps) {
  const tabs = [
    { id: 'all', label: 'All Invoices', count: counts.all },
    { id: 'sent', label: 'Sent', count: counts.sent },
    { id: 'paid', label: 'Paid', count: counts.paid },
    { id: 'overdue', label: 'Overdue', count: counts.overdue },
    { id: 'draft', label: 'Drafts', count: counts.draft },
  ];

  return (
    <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center shrink-0 ${activeTab === tab.id ? 'bg-indigo-600/10 text-indigo-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'}`}
        >
          {tab.label}
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-indigo-600/20 text-indigo-300' : 'bg-neutral-800 text-neutral-500'}`}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
