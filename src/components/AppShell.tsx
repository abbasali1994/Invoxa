"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Command, FileText, Wallet, Users, Receipt,
  ArrowRightLeft, BookOpen, PieChart, BarChart2,
  Settings, Plus, Menu, X,
} from "lucide-react";
import { ProfileDropdown } from "@/components/ProfileDropdown";

const navItems = [
  { href: "/", label: "Dashboard", icon: Command },
  { href: "/invoices", label: "Invoices", icon: FileText, quickAdd: "/invoices/new" },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/expenses", label: "Expenses", icon: Receipt, quickAdd: "/expenses/new" },
  { href: "/settlements", label: "Settlements", icon: ArrowRightLeft },
  { href: "/accounts", label: "Accounts", icon: Wallet },
];

const accountingItems = [
  { href: "/ledger", label: "Ledger", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-800 shrink-0">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Settlr
        </h1>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 text-neutral-400 hover:text-white rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, quickAdd }) => (
          <div key={href} className="group relative flex items-center">
            <Link
              href={href}
              onClick={onClose}
              className={`flex-1 flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${quickAdd ? "pr-10" : ""} ${
                isActive(href)
                  ? "bg-indigo-600/10 text-indigo-400"
                  : "text-neutral-300 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
            {quickAdd && (
              <Link
                href={quickAdd}
                onClick={onClose}
                className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-all z-10"
              >
                <Plus className="w-4 h-4" />
              </Link>
            )}
          </div>
        ))}

        <div className="pt-4 pb-2 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Accounting
        </div>

        {accountingItems.map(({ href, label, icon: Icon, }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive(href)
                ? "bg-indigo-600/10 text-indigo-400"
                : "text-neutral-300 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  const pathname = usePathname();
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-neutral-800 bg-neutral-950 flex-col fixed inset-y-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen overflow-y-auto">
        {/* Top header */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-8 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search across Settlr... (Cmd+K)"
                disabled
                className="w-72 bg-neutral-900 border border-neutral-800 rounded-md py-2 px-4 text-sm text-neutral-400 cursor-not-allowed opacity-70"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative text-neutral-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-2 ring-neutral-950">3</span>
            </button>
            <ProfileDropdown />
          </div>
        </header>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </>
  );
}
