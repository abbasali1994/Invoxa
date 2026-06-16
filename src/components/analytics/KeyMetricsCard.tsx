import React from 'react'

interface Props { metrics: any }
export function KeyMetricsCard({ metrics }: Props) {
  const items = [
    { label: 'Gross Margin', value: `${metrics?.grossMargin?.toFixed(1)}%`, color: '#34d399' },
    { label: 'Net Margin', value: `${metrics?.netMargin?.toFixed(1)}%`, color: '#34d399' },
    { label: 'Revenue Growth', value: `${metrics?.revenueGrowthRate?.toFixed(1)}%`, color: metrics?.revenueGrowthRate >= 0 ? '#34d399' : '#f87171' },
    { label: 'Expense Growth', value: `${metrics?.expenseGrowthRate?.toFixed(1)}%`, color: metrics?.expenseGrowthRate <= 0 ? '#34d399' : '#f87171' },
    { label: 'Settlement Efficiency', value: `${metrics?.settlementEfficiency?.toFixed(1)}%`, color: '#a78bfa' },
    { label: 'Client Retention', value: `${metrics?.clientRetentionScore?.toFixed(1)}%`, color: '#38bdf8' },
  ]
  return (
    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '1.5rem' }}>
      <p style={{ color: '#737373', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1rem' }}>Key Metrics</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {items.map(item => (
          <div key={item.label} style={{ background: '#0d0d0d', borderRadius: '8px', padding: '0.75rem' }}>
            <p style={{ color: item.color, fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{item.value}</p>
            <p style={{ color: '#737373', fontSize: '0.7rem', margin: 0 }}>{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
