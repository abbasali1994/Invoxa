import React from 'react'

interface Props { data: any }
const riskColors: Record<string, string> = { high: '#f87171', medium: '#fbbf24', low: '#34d399' }
export function CashflowCard({ data }: Props) {
  return (
    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '1.5rem' }}>
      <p style={{ color: '#737373', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.75rem' }}>Cashflow Analysis</p>
      <p style={{ color: 'white', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>{data?.headline}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ color: '#737373', fontSize: '0.8rem' }}>Overdue Risk:</span>
        <span style={{ color: riskColors[data?.overdueRisk?.toLowerCase() || 'medium'], fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>{data?.overdueRisk}</span>
        <span style={{ color: '#f87171', fontSize: '0.8rem', marginLeft: 'auto' }}>${data?.overdueAmount?.toLocaleString()}</span>
      </div>
      <p style={{ color: '#737373', fontSize: '0.72rem', margin: '0 0 0.4rem', textTransform: 'uppercase' }}>Cashflow Concerns</p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {(data?.cashflowGaps || []).map((g: string, i: number) => (
          <li key={i} style={{ color: '#a3a3a3', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{g}</li>
        ))}
      </ul>
    </div>
  )
}
