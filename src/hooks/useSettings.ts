import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PaymentMethod, PAYMENT_METHOD_LABELS } from "@/lib/paymentMethods";

export const TABS = ['General', 'Payments'] as const;
export type Tab = typeof TABS[number];

const DEFAULT_PAYMENT_METHODS = [
  { id: PaymentMethod.BANK_TRANSFER, name: PAYMENT_METHOD_LABELS[PaymentMethod.BANK_TRANSFER], type: PaymentMethod.BANK_TRANSFER, builtin: true },
  { id: PaymentMethod.CRYPTO, name: PAYMENT_METHOD_LABELS[PaymentMethod.CRYPTO], type: PaymentMethod.CRYPTO, builtin: true },
  { id: PaymentMethod.CASH, name: PAYMENT_METHOD_LABELS[PaymentMethod.CASH], type: PaymentMethod.CASH, builtin: true },
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
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [newMethod, setNewMethod] = useState({
    name: '', type: PaymentMethod.BANK_TRANSFER as string, instructions: '',
    bankAccountName: '', accountNumber: '', bankName: '', ifscCode: '', swiftCode: '',
    customFields: [] as { key: string; value: string }[]
  });

  useEffect(() => {
    const stored = localStorage.getItem('settlr_settings');
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

    const storedMethods = localStorage.getItem('settlr_payment_methods');
    if (storedMethods) {
      try { 
        const parsed = JSON.parse(storedMethods);
        const customMethods = parsed.map((m: any) => {
          let t = m.type;
          if (t === 'Bank Transfer') t = 'BANK_TRANSFER';
          if (t === 'Crypto (Token Transfer)' || t === 'Crypto') t = 'CRYPTO';
          if (t === 'Cash') t = 'CASH';

          let customFields = m.customFields;
          if (t === 'BANK_TRANSFER' && !customFields) {
            customFields = [
              { key: 'Account Name', value: m.bankAccountName || '' },
              { key: 'Account Number', value: m.accountNumber || '' },
              { key: 'Bank Name', value: m.bankName || '' },
              { key: 'IFSC Code', value: m.ifscCode || '' },
              { key: 'SWIFT Code', value: m.swiftCode || '' }
            ];
          }

          return { ...m, type: t, customFields };
        }).filter((m: any) => !m.builtin);
        setPaymentMethods([...DEFAULT_PAYMENT_METHODS, ...customMethods]);
      } catch {}
    }
  }, []);

  const saveGeneral = () => {
    localStorage.setItem('settlr_settings', JSON.stringify({ darkMode, currency, secondaryCurrency, dateFormat, timezone }));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast.success('Settings saved');
  };

  const addPaymentMethod = () => {
    if (!newMethod.name.trim()) return;

    let canonicalType = newMethod.type;
    if (canonicalType === 'Bank Transfer') canonicalType = 'BANK_TRANSFER';
    if (canonicalType === 'Crypto (Token Transfer)' || canonicalType === 'Crypto') canonicalType = 'CRYPTO';
    if (canonicalType === 'Cash') canonicalType = 'CASH';

    let bankAccountName = newMethod.bankAccountName;
    let accountNumber = newMethod.accountNumber;
    let bankName = newMethod.bankName;
    let ifscCode = newMethod.ifscCode;
    let swiftCode = newMethod.swiftCode;

    if (canonicalType === 'BANK_TRANSFER' && Array.isArray(newMethod.customFields)) {
      const getVal = (keys: string[]) => {
        const found = newMethod.customFields.find((f: any) => 
          keys.some(k => f.key?.toLowerCase().trim() === k.toLowerCase())
        );
        return found ? found.value : '';
      };

      bankAccountName = getVal(['account name', 'name']);
      accountNumber = getVal(['account number', 'account no', 'a/c', 'a/c no']);
      bankName = getVal(['bank name', 'bank']);
      ifscCode = getVal(['ifsc code', 'ifsc']);
      swiftCode = getVal(['swift code', 'swift']);
    }

    const normalizedMethod = { 
      ...newMethod, 
      type: canonicalType,
      bankAccountName,
      accountNumber,
      bankName,
      ifscCode,
      swiftCode
    };

    let updated;
    if (editingMethodId) {
      updated = paymentMethods.map(m => m.id === editingMethodId ? { ...normalizedMethod, id: editingMethodId, builtin: false } : m);
    } else {
      updated = [...paymentMethods, { ...normalizedMethod, id: `custom-${Date.now()}`, builtin: false }];
    }
    setPaymentMethods(updated);
    localStorage.setItem('settlr_payment_methods', JSON.stringify(updated));
    setNewMethod({
      name: '', type: PaymentMethod.BANK_TRANSFER as string, instructions: '',
      bankAccountName: '', accountNumber: '', bankName: '', ifscCode: '', swiftCode: '',
      customFields: [] as { key: string; value: string }[]
    });
    setShowAddMethod(false);
    setEditingMethodId(null);
    toast.success(editingMethodId ? 'Payment method updated' : 'Payment method added');
  };

  const removePaymentMethod = (id: string) => {
    const updated = paymentMethods.filter((m) => m.id !== id);
    setPaymentMethods(updated);
    localStorage.setItem('settlr_payment_methods', JSON.stringify(updated));
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
    editingMethodId, setEditingMethodId,
    saveGeneral, addPaymentMethod, removePaymentMethod
  };
}
