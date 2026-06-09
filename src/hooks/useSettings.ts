import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export const TABS = ['General', 'Payments', 'Scheduler', 'Team'] as const;
export type Tab = typeof TABS[number];

const DEFAULT_PAYMENT_METHODS = [
  { id: 'BANK_TRANSFER', name: 'Bank Transfer', type: 'BANK_TRANSFER', builtin: true },
  { id: 'CRYPTO', name: 'Token Transfer (Crypto)', type: 'CRYPTO', builtin: true },
  { id: 'CASH', name: 'Cash', type: 'CASH', builtin: true },
];

export function useSettings() {
  const searchParams = useSearchParams();
  const defaultTab = (searchParams.get('tab') as Tab) ?? 'General';
  const [activeTab, setActiveTab] = useState<Tab>(TABS.includes(defaultTab as Tab) ? defaultTab as Tab : 'General');
  
  const [darkMode, setDarkMode] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [secondaryCurrency, setSecondaryCurrency] = useState('INR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const [paymentMethods, setPaymentMethods] = useState<any[]>([...DEFAULT_PAYMENT_METHODS]);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newMethod, setNewMethod] = useState({ 
    name: '', type: 'Bank Transfer', instructions: '',
    bankAccountName: '', accountNumber: '', bankName: '', ifscCode: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('invoxa_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.darkMode !== undefined) setDarkMode(parsed.darkMode);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.secondaryCurrency) setSecondaryCurrency(parsed.secondaryCurrency);
        if (parsed.dateFormat) setDateFormat(parsed.dateFormat);
        if (parsed.timezone) setTimezone(parsed.timezone);
      } catch {}
    }

    const storedMethods = localStorage.getItem('invoxa_payment_methods');
    if (storedMethods) {
      try { 
        const parsed = JSON.parse(storedMethods);
        const customMethods = parsed.filter((m: any) => !m.builtin);
        setPaymentMethods([...DEFAULT_PAYMENT_METHODS, ...customMethods]);
      } catch {}
    }
  }, []);

  const saveGeneral = () => {
    localStorage.setItem('invoxa_settings', JSON.stringify({ darkMode, currency, secondaryCurrency, dateFormat, timezone }));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast.success('Settings saved');
  };

  const addPaymentMethod = () => {
    if (!newMethod.name.trim()) return;
    const updated = [...paymentMethods, { ...newMethod, id: `custom-${Date.now()}`, builtin: false }];
    setPaymentMethods(updated);
    localStorage.setItem('invoxa_payment_methods', JSON.stringify(updated));
    setNewMethod({ 
      name: '', type: 'Bank Transfer', instructions: '',
      bankAccountName: '', accountNumber: '', bankName: '', ifscCode: '' 
    });
    setShowAddMethod(false);
    toast.success('Payment method added');
  };

  const removePaymentMethod = (id: string) => {
    const updated = paymentMethods.filter((m) => m.id !== id);
    setPaymentMethods(updated);
    localStorage.setItem('invoxa_payment_methods', JSON.stringify(updated));
    toast.success('Removed');
  };

  return {
    activeTab, setActiveTab,
    darkMode, setDarkMode,
    currency, setCurrency,
    secondaryCurrency, setSecondaryCurrency,
    dateFormat, setDateFormat,
    timezone, setTimezone,
    paymentMethods, showAddMethod, setShowAddMethod, newMethod, setNewMethod,
    saveGeneral, addPaymentMethod, removePaymentMethod
  };
}
