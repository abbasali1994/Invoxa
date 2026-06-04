import React from 'react';
import { Search } from "lucide-react";

export interface InvoiceFiltersProps {
  search: string;
  setSearch: (val: string) => void;
}

export function InvoiceFilters({ search, setSearch }: InvoiceFiltersProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
      <input 
        type="text" 
        placeholder="Search by invoice # or client..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 pl-9 pr-4 text-sm text-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}
