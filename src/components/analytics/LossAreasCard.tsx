import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface Area { area: string; amount: number; severity: string; description: string; fix: string }
interface Props { areas: Area[] }
const severityColors: Record<string, string> = { high: '#f87171', medium: '#fbbf24', low: '#34d399' }
export function LossAreasCard({ areas }: Props) {
  return (
    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <AlertTriangle size={16} color="#f87171" />
        <p style={{ color: '#737373', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Loss Areas</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {(areas || []).map((area, i) => (
          <div key={i} style={{ background: '#0d0d0d', borderRadius: '8px', padding: '0.875rem', borderLeft: `3px solid ${severityColors[area.severity?.toLowerCase() || 'medium']}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ color: 'white', fontSize: '0.825rem', fontWeight: 600 }}>{area.area}</span>
              <span style={{ color: '#f87171', fontSize: '0.8rem' }}>₹{area.amount?.toLocaleString('en-IN')}</span>
            </div>
            <p style={{ color: '#a3a3a3', fontSize: '0.775rem', margin: '0 0 0.4rem', lineHeight: 1.5 }}>{area.description}</p>
            <p style={{ color: '#34d399', fontSize: '0.75rem', margin: 0 }}>→ {area.fix}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
