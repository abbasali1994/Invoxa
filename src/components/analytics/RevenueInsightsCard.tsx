import React from 'react'

interface Props { data: any }
const riskColors: Record<string, string> = { high: '#f87171', medium: '#fbbf24', low: '#34d399' }
export function RevenueInsightsCard({ data }: Props) {
  return (
    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '1.5rem' }}>
      <p style={{ color: '#737373', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.75rem' }}>Revenue Insights</p>
      <p style={{ color: 'white', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>{data?.headline}</p>
      <div style={{ background: '#0d0d0d', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem' }}>
        <p style={{ color: '#737373', fontSize: '0.7rem', margin: '0 0 0.25rem' }}>Top Client</p>
        <p style={{ color: 'white', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{data?.topPerformingClient}</p>
        <p style={{ color: '#34d399', fontSize: '0.8rem', margin: 0 }}>${data?.topClientRevenue?.toLocaleString()}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ color: '#737373', fontSize: '0.75rem' }}>Concentration Risk</span>
        <span style={{ color: riskColors[data?.revenueConcentrationRisk?.toLowerCase() || 'medium'] || '#fbbf24', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{data?.revenueConcentrationRisk}</span>
      </div>
      <p style={{ color: '#a3a3a3', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>{data?.details}</p>
    </div>
  )
}
