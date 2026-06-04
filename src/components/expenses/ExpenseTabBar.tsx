import React from "react";

export function ExpenseTabBar({ counts, activeTab, setActiveTab }: { counts: any, activeTab: string, setActiveTab: (t: any) => void }) {
  const tabs = [
    { id: 'all', label: 'All Expenses', count: counts.all },
    { id: 'saved', label: 'Saved', count: counts.saved },
    { id: 'draft', label: 'Draft', count: counts.draft },
    { id: 'recurring', label: 'Recurring', count: counts.recurring },
    { id: 'overdue', label: 'Overdue', count: counts.overdue },
  ];

  return (
    <div className="flex space-x-1 border-b border-neutral-800">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
          }`}
        >
          {tab.label} <span className="ml-1.5 px-2 py-0.5 rounded-full bg-neutral-800 text-xs text-neutral-300">{tab.count}</span>
        </button>
      ))}
    </div>
  );
}
