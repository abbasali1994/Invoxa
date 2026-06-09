import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { InvoiceRow } from "./InvoiceRow";

export interface InvoiceTableProps {
  invoices: any[];
  toggleStar: (id: string, currentStarred: boolean) => void;
  deleteInvoice: (id: string) => void;
}

type SortField = 'client' | 'date' | 'amount' | null;
type SortDirection = 'asc' | 'desc' | null;

export function InvoiceTable({ invoices, toggleStar, deleteInvoice }: InvoiceTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: 'client' | 'date' | 'amount') => {
    if (sortField === field) {
      if (field === 'client') {
        if (sortDirection === 'asc') setSortDirection('desc');
        else if (sortDirection === 'desc') { setSortDirection(null); setSortField(null); }
      } else {
        if (sortDirection === 'desc') setSortDirection('asc');
        else if (sortDirection === 'asc') { setSortDirection(null); setSortField(null); }
      }
    } else {
      setSortField(field);
      setSortDirection(field === 'client' ? 'asc' : 'desc');
    }
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    
    if (sortField === 'client') {
      const aName = a.client?.name || '';
      const bName = b.client?.name || '';
      return sortDirection === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
    }
    
    if (sortField === 'date') {
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    }
    
    if (sortField === 'amount') {
      const aAmt = a.total || 0;
      const bAmt = b.total || 0;
      return sortDirection === 'asc' ? aAmt - bAmt : bAmt - aAmt;
    }
    
    return 0;
  });

  const renderSortIcon = (field: 'client' | 'date' | 'amount') => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-indigo-400" /> : <ChevronDown className="w-3 h-3 text-indigo-400" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-neutral-400">
        <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
          <tr>
            <th className="px-4 py-3 font-medium w-10"></th>
            <th className="px-5 py-3 font-medium">Invoice #</th>
            
            <th 
              className="px-5 py-3 font-medium cursor-pointer group hover:text-white transition-colors select-none" 
              onClick={() => handleSort('client')}
            >
              <div className="flex items-center gap-1">
                Client {renderSortIcon('client')}
              </div>
            </th>
            
            <th 
              className="px-5 py-3 font-medium cursor-pointer group hover:text-white transition-colors select-none" 
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center gap-1">
                Date {renderSortIcon('date')}
              </div>
            </th>
            
            <th className="px-5 py-3 font-medium">Paid At</th>
            
            <th 
              className="px-5 py-3 font-medium cursor-pointer group hover:text-white transition-colors select-none" 
              onClick={() => handleSort('amount')}
            >
              <div className="flex items-center justify-end gap-1">
                {renderSortIcon('amount')} Amount 
              </div>
            </th>
            
            <th className="px-5 py-3 font-medium text-center">Status</th>
            <th className="px-5 py-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {sortedInvoices.map(inv => (
            <InvoiceRow 
              key={inv.id} 
              inv={inv} 
              toggleStar={toggleStar} 
              deleteInvoice={deleteInvoice} 
            />
          ))}
          {sortedInvoices.length === 0 && (
            <tr>
              <td colSpan={8} className="px-5 py-12 text-center text-neutral-500">
                <FileText className="w-8 h-8 text-neutral-700 mb-3 mx-auto" />
                <p>No invoices found.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
