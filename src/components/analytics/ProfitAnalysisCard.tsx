import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props { data: any }
export function ProfitAnalysisCard({ data }: Props) {
  const TrendIcon = data?.trend === 'improving' ? TrendingUp : data?.trend === 'declining' ? TrendingDown : Minus
  const trendColor = data?.trend === 'improving' ? '#34d399' : data?.trend === 'declining' ? '#f87171' : '#fbbf24'
  return (
    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <p style={{ color: '#737373', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Profit Analysis</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: trendColor, fontSize: '0.75rem' }}>
          <TrendIcon size={14} />
          <span style={{ textTransform: 'capitalize' }}>{data?.trend}</span>
        </div>
      </div>
      <p style={{ color: 'white', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>{data?.headline}</p>
      <p style={{ color: '#a3a3a3', fontSize: '0.825rem', lineHeight: 1.6, margin: '0 0 0.75rem' }}>{data?.details}</p>
      <p style={{ color: trendColor, fontSize: '0.75rem', margin: 0, fontStyle: 'italic' }}>{data?.trendReason}</p>
    </div>
  )
}
