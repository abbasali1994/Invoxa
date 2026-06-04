import { Plus } from "lucide-react";
import { AccountCards } from "@/components/accounts/AccountCards";
import { RecentTransactionsTable } from "@/components/accounts/RecentTransactionsTable";

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Accounts</h2>
          <p className="text-neutral-400">Manage balances, crypto holdings, and expenses.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Add Account
        </button>
      </div>

      <AccountCards />
      <RecentTransactionsTable />
    </div>
  );
}

