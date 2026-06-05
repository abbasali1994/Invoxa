import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CommandPalette } from "@/components/CommandPalette";
import { Toaster } from "sonner";
import Link from "next/link";
import {
  Network, Command, FileText, Briefcase, Wallet, Zap,
  Users, Receipt, ArrowRightLeft, BookOpen, PieChart,
  BarChart2, Activity, Settings, RefreshCcw, Plus,
} from "lucide-react";
import { SessionProvider } from "@/components/SessionProvider";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Invoxa | AI-Native Financial Operations",
  description: "Financial operations platform for agencies and freelancers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Detect login page server-side to hide sidebar
  const headersList = headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isLoginPage = pathname === "/login" || pathname.startsWith("/login");

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-neutral-950 text-neutral-50 flex`}>
        <SessionProvider>
          <CommandPalette />
          <Toaster theme="dark" position="bottom-right" />

          {!isLoginPage && (
            <>
              {/* Sidebar */}
              <aside className="w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col fixed inset-y-0 z-30">
                <div className="h-16 flex items-center px-6 border-b border-neutral-800">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Invoxa</h1>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                  <Link href="/" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"><Command className="w-4 h-4" /> <span>Dashboard</span></Link>
                  <div className="group relative flex items-center">
                    <Link href="/invoices" className="flex-1 flex items-center space-x-3 px-3 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors pr-10"><FileText className="w-4 h-4" /> <span>Invoices</span></Link>
                    <Link href="/invoices/new" className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-all z-10"><Plus className="w-4 h-4" /></Link>
                  </div>
                  <Link href="/clients" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"><Users className="w-4 h-4" /> <span>Clients</span></Link>                  
                  <div className="group relative flex items-center">
                    <Link href="/expenses" className="flex-1 flex items-center space-x-3 px-3 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors pr-10"><Receipt className="w-4 h-4" /> <span>Expenses</span></Link>
                    <Link href="/expenses/new" className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-all z-10"><Plus className="w-4 h-4" /></Link>
                  </div>
                  <Link href="/settlements" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"><ArrowRightLeft className="w-4 h-4" /> <span>Settlements</span></Link>
                  <Link href="/accounts" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"><Wallet className="w-4 h-4" /> <span>Accounts</span></Link>
                  <div className="pt-4 pb-2 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Accounting</div>
                  <Link href="/ledger" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"><BookOpen className="w-4 h-4" /> <span>Ledger</span></Link>
                  <Link href="/ledger/trial-balance" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"><PieChart className="w-4 h-4 ml-2" /> <span>Trial Balance</span></Link>
                  <Link href="/reports" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"><BarChart2 className="w-4 h-4" /> <span>Reports</span></Link>
                  {/* <div className="pt-4 pb-2 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Operations</div>
                  <Link href="/ai-ops" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"><Zap className="w-4 h-4" /> <span>AI Ops</span></Link>
                  <Link href="/activity" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"><Activity className="w-4 h-4" /> <span>Activity</span></Link> */}
                  <Link href="/settings" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"><Settings className="w-4 h-4" /> <span>Settings</span></Link>
                </nav>
              </aside>

              {/* Main Content */}
              <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search across Invoxa... (Cmd+K)"
                      disabled
                      className="w-96 bg-neutral-900 border border-neutral-800 rounded-md py-2 px-4 text-sm text-neutral-400 cursor-not-allowed opacity-70"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="relative text-neutral-400 hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                      <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-2 ring-neutral-950">3</span>
                    </button>
                    <ProfileDropdown />
                  </div>
                </header>
                {children}
              </main>
            </>
          )}

          {isLoginPage && children}
        </SessionProvider>
      </body>
    </html>
  );
}
