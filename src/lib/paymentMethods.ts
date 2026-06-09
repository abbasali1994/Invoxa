export const PaymentMethod = {
  BANK_TRANSFER: 'BANK_TRANSFER',
  CRYPTO: 'CRYPTO',
  CASH: 'CASH',
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  BANK_TRANSFER: 'Bank Transfer',
  CRYPTO: 'Crypto (Token Transfer)',
  CASH: 'Cash',
};

// Legacy DB values per canonical type — used in backwards-compat Prisma queries
export const PAYMENT_METHOD_ALIASES: Record<PaymentMethod, string[]> = {
  BANK_TRANSFER: ['BANK_TRANSFER', 'BANK TRANSFER', 'Bank Transfer'],
  CRYPTO: ['CRYPTO', 'CRYPTO TRANSFER', 'Crypto', 'Token Transfer (Crypto)'],
  CASH: ['CASH', 'PETTY CASH', 'Cash'],
};
