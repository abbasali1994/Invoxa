import React, { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { MoreVertical, Edit2, Trash2, Receipt, Eye, MessageCircle, Send, Mail, Link as LinkIcon, ChevronUp, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

type SortField = 'date' | 'vendor' | 'amount' | null;
type SortDirection = 'asc' | 'desc' | null;

export function ExpenseTable({ expenses, handleDelete, handleShare }: { expenses: any[], handleDelete: (id: string) => void, handleShare: (expense: any, type: string) => void }) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: 'date' | 'vendor' | 'amount') => {
    if (sortField === field) {
      if (field === 'vendor') {
        if (sortDirection === 'asc') setSortDirection('desc');
        else if (sortDirection === 'desc') { setSortDirection(null); setSortField(null); }
      } else {
        if (sortDirection === 'desc') setSortDirection('asc');
        else if (sortDirection === 'asc') { setSortDirection(null); setSortField(null); }
      }
    } else {
      setSortField(field);
      setSortDirection(field === 'vendor' ? 'asc' : 'desc');
    }
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    if (sortField === 'vendor') {
      const aName = a.vendor || '';
      const bName = b.vendor || '';
      return sortDirection === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
    }

    if (sortField === 'date') {
      const aDate = new Date(a.date || 0).getTime();
      const bDate = new Date(b.date || 0).getTime();
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    }

    if (sortField === 'amount') {
      const aAmt = a.amount || 0;
      const bAmt = b.amount || 0;
      return sortDirection === 'asc' ? aAmt - bAmt : bAmt - aAmt;
    }

    return 0;
  });

  const renderSortIcon = (field: 'date' | 'vendor' | 'amount') => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-indigo-400" /> : <ChevronDown className="w-3 h-3 text-indigo-400" />;
  };

  const renderNotesPreview = (expense: any) => {
    const text = expense.notes || (Array.isArray(expense.lineItems) && expense.lineItems[0] ? expense.lineItems[0].description : '');
    if (!text) return <span className="text-neutral-600 italic">No notes</span>;
    return text.length > 40 ? text.substring(0, 40) + '...' : text;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
          <tr>
            <th className="px-5 py-3 font-medium">
              <button onClick={() => handleSort('date')} className="flex items-center gap-1 group hover:text-neutral-300 transition-colors">
                Date {renderSortIcon('date')}
              </button>
            </th>
            <th className="px-5 py-3 font-medium">
              <button onClick={() => handleSort('vendor')} className="flex items-center gap-1 group hover:text-neutral-300 transition-colors">
                Vendor {renderSortIcon('vendor')}
              </button>
            </th>
            <th className="px-5 py-3 font-medium">Category</th>
            <th className="px-5 py-3 font-medium">Notes/Description</th>
            <th className="px-5 py-3 font-medium text-right">
              <button onClick={() => handleSort('amount')} className="flex items-center gap-1 ml-auto group hover:text-neutral-300 transition-colors">
                Amount {renderSortIcon('amount')}
              </button>
            </th>
            <th className="px-5 py-3 font-medium text-right w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {sortedExpenses.map(e => (
            <tr key={e.id} onClick={() => router.push(`/expenses/${e.id}`)} className="hover:bg-neutral-800/30 transition-colors cursor-pointer group">
              <td className="px-5 py-4 text-neutral-400">{format(new Date(e.date), 'MMM d, yyyy')}</td>
              <td className="px-5 py-4 font-medium flex items-center gap-2">
                <Receipt className="w-4 h-4 text-neutral-500" /> {e.vendor}
                {e.status === 'DRAFT' && <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-700 text-neutral-300 ml-2">DRAFT</span>}
              </td>
              <td className="px-5 py-4"><span className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300">{e.category}</span></td>
              <td className="px-5 py-4 text-neutral-400">{renderNotesPreview(e)}</td>
              <td className="px-5 py-4 text-right font-medium text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: e.currency }).format(e.amount)}</td>
              <td className="px-5 py-4 text-right" onClick={(ev) => ev.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-neutral-800 text-neutral-200">
                    <DropdownMenuItem onClick={() => router.push(`/expenses/${e.id}`)} className="hover:bg-neutral-800 cursor-pointer"><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/expenses/${e.id}/edit`)} className="hover:bg-neutral-800 cursor-pointer"><Edit2 className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-800" />
                    <DropdownMenuItem onClick={() => handleShare(e, 'whatsapp')} className="hover:bg-neutral-800 cursor-pointer"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(e, 'telegram')} className="hover:bg-neutral-800 cursor-pointer"><Send className="w-4 h-4 mr-2" /> Telegram</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(e, 'email')} className="hover:bg-neutral-800 cursor-pointer"><Mail className="w-4 h-4 mr-2" /> Email</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare(e, 'copy')} className="hover:bg-neutral-800 cursor-pointer"><LinkIcon className="w-4 h-4 mr-2" /> Copy Link</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-800" />
                    <DropdownMenuItem onClick={() => handleDelete(e.id)} className="text-rose-500 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
          {expenses.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-neutral-500 flex-col items-center flex">
                <Receipt className="w-8 h-8 text-neutral-700 mb-3" />
                No expenses found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
