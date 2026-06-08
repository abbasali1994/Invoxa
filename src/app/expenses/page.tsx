"use client";

import { useRouter } from "next/navigation";
import { Plus, Search, Filter } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseTabBar } from "@/components/expenses/ExpenseTabBar";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { UploadExpenseButton } from "@/components/expenses/UploadExpenseButton";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

export default function ExpensesPage() {
  const router = useRouter();
  const { expenses, counts, activeTab, setActiveTab, handleDelete, handleShare, dateRange, setDateRange } = useExpenses();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-neutral-400">Track and categorize outgoing payments.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <UploadExpenseButton />
          <button onClick={() => router.push('/expenses/new')} className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </button>
        </div>
      </div>
      
      <ExpenseTabBar counts={counts} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
        <div className="p-4 border-b border-neutral-800 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input type="text" placeholder="Search vendor..." className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 pl-9 pr-4 text-sm" />
          </div>
          <button className="flex items-center px-4 border border-neutral-800 bg-neutral-950 rounded-md text-sm"><Filter className="w-4 h-4 mr-2" /> Filter</button>
        </div>
        <ExpenseTable expenses={expenses} handleDelete={handleDelete} handleShare={handleShare} />
      </div>
    </div>
  );
}

