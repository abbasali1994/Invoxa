import React from 'react'

interface Props { summary: string; metrics: any }
export function ExecutiveSummaryCard({ summary, metrics }: Props) {
  return (
    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '1.5rem' }}>
      <p style={{ color: '#737373', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.75rem' }}>Executive Summary</p>
      <p style={{ color: 'white', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 1.25rem' }}>{summary}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Gross Margin', value: `${metrics?.grossMargin?.toFixed(1) || 0}%` },
          { label: 'Net Margin', value: `${metrics?.netMargin?.toFixed(1) || 0}%` },
          { label: 'Settlement Efficiency', value: `${metrics?.settlementEfficiency?.toFixed(1) || 0}%` },
        ].map(m => (
          <div key={m.label} style={{ background: '#0d0d0d', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{m.value}</p>
            <p style={{ color: '#737373', fontSize: '0.7rem', margin: 0 }}>{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
