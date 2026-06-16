import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'

interface Trend { trend: string; direction: string; timeframe: string; description: string; confidence: string; dataPoints?: number[] }
interface Props { trends: Trend[] }
const directionConfig: Record<string, { color: string; Icon: any }> = {
  positive: { color: '#34d399', Icon: TrendingUp },
  negative: { color: '#f87171', Icon: TrendingDown },
  neutral: { color: '#fbbf24', Icon: Minus },
}
const confColors: Record<string, string> = { high: '#34d399', medium: '#fbbf24', low: '#737373' }

export function FutureTrendsCard({ trends }: Props) {
  return (
    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '1.5rem' }}>
      <p style={{ color: '#737373', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1rem' }}>Future Trends Projections</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {(trends || []).map((trend, i) => {
          const { color, Icon } = directionConfig[trend.direction?.toLowerCase() || 'neutral'] || directionConfig.neutral
          const chartData = (trend.dataPoints || []).map((val, idx) => ({ name: idx, value: val }))
          return (
            <div key={i} style={{ background: '#0d0d0d', borderRadius: '8px', padding: '1rem', borderTop: `2px solid ${color}`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <Icon size={14} color={color} />
                <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>{trend.trend}</span>
              </div>
              
              {chartData.length > 0 && (
                <div style={{ height: '60px', width: '100%', marginBottom: '0.75rem', marginTop: '0.25rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <YAxis domain={['dataMin', 'dataMax']} hide={true} />
                      <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 2, fill: '#0d0d0d', strokeWidth: 2 }} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <p style={{ color: '#a3a3a3', fontSize: '0.75rem', lineHeight: 1.5, margin: '0 0 0.75rem', flexGrow: 1 }}>{trend.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ color: '#525252', fontSize: '0.68rem' }}>{trend.timeframe}</span>
                <span style={{ color: confColors[trend.confidence?.toLowerCase() || 'medium'], fontSize: '0.68rem', textTransform: 'capitalize', fontWeight: 500 }}>{trend.confidence} confidence</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
