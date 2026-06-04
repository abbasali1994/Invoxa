import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Edit2, Trash2, Download, Share2, MessageCircle, Send, Mail, Link as LinkIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function ExpenseDetailHeader({ expense, id, handleDelete }: { expense: any, id: string, handleDelete: () => void }) {
  const handleShare = (type: string) => {
    if (!expense) return;
    const text = `Expense: ${expense.vendor}\nCategory: ${expense.category}\nAmount: ${expense.currency} ${expense.amount}\nDate: ${format(new Date(expense.date), 'MMM d, yyyy')}`;
    const url = `${window.location.origin}/expenses/${id}`;

    switch (type) {
      case 'whatsapp': window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank'); break;
      case 'telegram': window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank'); break;
      case 'email': window.open(`mailto:?subject=${encodeURIComponent(`Expense Receipt: ${expense.vendor}`)}&body=${encodeURIComponent(text + '\n\nView: ' + url)}`, '_blank'); break;
      case 'copy': navigator.clipboard.writeText(url); toast.success('Link copied to clipboard'); break;
      case 'pdf': window.open(`/api/expenses/${id}/pdf`, '_blank'); break;
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Link href="/expenses" className="p-2 rounded-md hover:bg-neutral-800 transition-colors text-neutral-400">
        <ArrowLeft className="w-5 h-5" />
      </Link>
      <div className="flex-1">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          {expense.vendor} <span className="text-neutral-500 font-normal">#{expense.expenseNumber || id.slice(0,8)}</span>
        </h2>
        <div className="flex gap-2 mt-1">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${expense.status === 'SAVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400'}`}>
            {expense.status}
          </span>
          {expense.isRecurring && <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400">Recurring</span>}
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Link href={`/expenses/${id}/edit`} className="p-2 bg-neutral-900 border border-neutral-800 rounded-md hover:bg-neutral-800 text-neutral-300">
          <Edit2 className="w-4 h-4" />
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm font-medium hover:bg-neutral-800 text-neutral-300">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-neutral-800 text-neutral-200">
            <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="hover:bg-neutral-800 cursor-pointer"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('telegram')} className="hover:bg-neutral-800 cursor-pointer"><Send className="w-4 h-4 mr-2" /> Telegram</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('email')} className="hover:bg-neutral-800 cursor-pointer"><Mail className="w-4 h-4 mr-2" /> Email</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem onClick={() => handleShare('copy')} className="hover:bg-neutral-800 cursor-pointer"><LinkIcon className="w-4 h-4 mr-2" /> Copy Link</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('pdf')} className="hover:bg-neutral-800 cursor-pointer"><Download className="w-4 h-4 mr-2" /> Download PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <a href={`/api/expenses/${id}/pdf`} target="_blank" rel="noreferrer" className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Download className="w-4 h-4 mr-2" /> PDF
        </a>

        <button onClick={handleDelete} className="p-2 border border-rose-500/20 bg-rose-500/10 text-rose-500 rounded-md hover:bg-rose-500/20 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
