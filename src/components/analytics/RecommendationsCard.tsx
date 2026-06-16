import React from 'react'
import { Target } from 'lucide-react'

interface Rec { priority: string; action: string; expectedImpact: string; timeframe: string }
interface Props { recommendations: Rec[] }
const priorityConfig: Record<string, { color: string; bg: string }> = {
  critical: { color: '#f87171', bg: '#1a0a0a' },
  high: { color: '#fbbf24', bg: '#1a1400' },
  medium: { color: '#a78bfa', bg: '#0d0b1e' },
}
export function RecommendationsCard({ recommendations }: Props) {
  return (
    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Target size={16} color="#a78bfa" />
        <p style={{ color: '#737373', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Actionable Recommendations</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {(recommendations || []).map((rec, i) => {
          const { color, bg } = priorityConfig[rec.priority?.toLowerCase() || 'medium'] || priorityConfig.medium
          return (
            <div key={i} style={{ background: bg, border: `1px solid ${color}30`, borderRadius: '8px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '100px', background: `${color}20`, color, textTransform: 'uppercase', fontWeight: 600 }}>{rec.priority}</span>
                <span style={{ color: 'white', fontSize: '0.825rem', fontWeight: 600 }}>{rec.action}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#34d399', fontSize: '0.775rem', margin: 0 }}>Impact: {rec.expectedImpact}</p>
                <span style={{ color: '#525252', fontSize: '0.72rem' }}>{rec.timeframe}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
