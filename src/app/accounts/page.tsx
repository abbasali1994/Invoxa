'use client'
import { useEffect, useState } from 'react'
import { Building2, Coins, Banknote } from 'lucide-react'
import { AccountsBarChart } from '@/components/accounts/AccountsBarChart'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { DateRangePicker, defaultDateRange, type DateRange } from '@/components/ui/DateRangePicker'

interface AccountSummary {
  cards: { bankTotal: number; cryptoUnsettled: number; cashTotal: number }
  yearlyData: { month: string; bankTransfer: number; crypto: number; cash: number }[]
  allMonthsWeeklyData: {
    monthName: string
    weeks: { month: string; bankTransfer: number; crypto: number; cash: number }[]
  }[]
}

const cardConfig = [
  {
    key: 'bankTotal' as const,
    title: 'Bank Transfer',
    subtitle: 'Wire / NEFT / SWIFT / WISE',
    icon: Building2,
    accent: '#6366f1',
    method: 'BANK_TRANSFER',
    currency: 'INR' as const,
    link: '/settlements?method=BANK_TRANSFER',
    linkLabel: 'View Settlements →',
  },
  {
    key: 'cryptoUnsettled' as const,
    title: 'Crypto Invoices',
    subtitle: 'Sent — not yet settled',
    icon: Coins,
    accent: '#fbbf24',
    method: 'CRYPTO',
    badge: 'Unsettled',
    currency: 'USD' as const,
    link: '/invoices',
    linkLabel: 'View Invoices →',
  },
  {
    key: 'cashTotal' as const,
    title: 'Cash Received',
    subtitle: 'Direct cash payments',
    icon: Banknote,
    accent: '#34d399',
    method: 'CASH',
    currency: 'INR' as const,
    link: '/settlements?method=CASH',
    linkLabel: 'View Settlements →',
  },
]

export default function AccountsPage() {
  const [data, setData] = useState<AccountSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange)

  useEffect(() => {
    setLoading(true)
    const { from, to } = dateRange
    fetch(`/api/accounts/summary?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Failed to load account data'))
      .finally(() => setLoading(false))
  }, [dateRange])

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) return <p style={{ color: '#ef4444', padding: '2rem' }}>{error}</p>
  if (!data) return null

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', margin: 0 }}>
            Financial Accounts
          </h1>
          <p style={{ color: '#737373', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            Receipts by payment method across all settlements
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* 3 Account Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {cardConfig.map((card) => {
          const Icon = card.icon
          const value = data.cards[card.key]
          return (
            <div key={card.key} style={{
              background: '#111',
              border: '1px solid #1f1f1f',
              borderRadius: '12px',
              padding: '1.25rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Accent glow */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: card.accent,
                borderRadius: '12px 12px 0 0',
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: `${card.accent}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={18} color={card.accent} />
                  </div>
                  <div>
                    <p style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
                      {card.title}
                    </p>
                    <p style={{ color: '#737373', fontSize: '0.72rem', margin: 0 }}>
                      {card.subtitle}
                    </p>
                  </div>
                </div>
                {card.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '100px',
                    background: '#fbbf2420',
                    color: '#fbbf24',
                    border: '1px solid #fbbf2440',
                  }}>
                    {card.badge}
                  </span>
                )}
              </div>

              <p style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'white',
                margin: '0 0 1rem',
                letterSpacing: '-0.02em',
              }}>
                {card.currency === 'USD'
                  ? `$${value.toLocaleString('en-US')}`
                  : `₹${value.toLocaleString('en-IN')}`}
              </p>

              <a
                href={card.link}
                style={{
                  fontSize: '0.75rem',
                  color: '#737373',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  borderTop: '1px solid #1f1f1f',
                  paddingTop: '0.75rem',
                }}
              >
                {card.linkLabel}
              </a>
            </div>
          )
        })}
      </div>

      {/* Combined Bar Chart */}
      <AccountsBarChart
        yearlyData={data.yearlyData}
        allMonthsWeeklyData={data.allMonthsWeeklyData}
      />
    </div>
  )
}
