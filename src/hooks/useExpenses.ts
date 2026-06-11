import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { defaultDateRange, type DateRange } from "@/components/ui/DateRangePicker";

export function useExpenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [counts, setCounts] = useState({ all: 0, saved: 0, draft: 0, recurring: 0, overdue: 0 });
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'draft' | 'recurring' | 'overdue'>('all');
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchExpenses = (tab: string, range: DateRange, search: string) => {
    const params = new URLSearchParams({ from: range.from, to: range.to });
    if (tab === 'saved') params.set('status', 'SAVED');
    if (tab === 'draft') params.set('status', 'DRAFT');
    if (tab === 'recurring') params.set('isRecurring', 'true');
    if (tab === 'overdue') params.set('isRecurring', 'true');
    if (search) params.set('search', search);

    fetch(`/api/expenses?${params}`).then(res=>res.json()).then(data => {if(Array.isArray(data)) setExpenses(data);});
  };

  const fetchCounts = () => {
    fetch('/api/expenses/counts').then(res=>res.json()).then(data => {if(data) setCounts(data);});
  };

  useEffect(() => {
    fetchExpenses(activeTab, dateRange, searchQuery);
    fetchCounts();
  }, [activeTab, dateRange, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense? This cannot be undone.')) return;
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    setExpenses(prev => prev.filter(e => e.id !== id));
    fetchCounts();
    toast.success('Expense deleted');
  };

  const handleShare = (expense: any, type: string) => {
    const text = `Expense: ${expense.vendor}\nCategory: ${expense.category}\nAmount: ${expense.currency} ${expense.amount}\nDate: ${format(new Date(expense.date), 'MMM d, yyyy')}`;
    const url = `${window.location.origin}/expenses/${expense.id}`;

    switch (type) {
      case 'whatsapp': window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank'); break;
      case 'telegram': window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank'); break;
      case 'email': window.open(`mailto:?subject=${encodeURIComponent(`Expense Receipt: ${expense.vendor}`)}&body=${encodeURIComponent(text + '\n\nView: ' + url)}`, '_blank'); break;
      case 'copy': navigator.clipboard.writeText(url); toast.success('Link copied to clipboard'); break;
    }
  };

  return { expenses, counts, activeTab, setActiveTab, handleDelete, handleShare, dateRange, setDateRange, searchQuery, setSearchQuery };
}
