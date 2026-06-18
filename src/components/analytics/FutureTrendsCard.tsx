import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts'

interface Trend { trend: string; direction: string; timeframe: string; description: string; confidence: string; dataPoints?: any[] }
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
      <div style={{ display: 'grid', gridTemplateColumns: (trends?.length === 1) ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem' }}>
        {(trends || []).map((trend, i) => {
          const { color, Icon } = directionConfig[trend.direction?.toLowerCase() || 'neutral'] || directionConfig.neutral
          const chartData = (trend.dataPoints || []).map((val: any, idx) => {
            if (typeof val === 'number') return { name: `T+${idx+1}`, value: val };
            return { name: val.label || `T+${idx+1}`, value: val.value || 0 };
          })
          return (
            <div key={i} style={{ background: '#0d0d0d', borderRadius: '8px', padding: '1.5rem', borderTop: `2px solid ${color}`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <Icon size={16} color={color} />
                <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>{trend.trend}</span>
              </div>
              
              {chartData.length > 0 && (
                <div style={{ height: '200px', width: '100%', marginBottom: '1.5rem', marginTop: '1rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 25, right: 15, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                      <XAxis dataKey="name" stroke="#333" tick={{ fill: '#737373', fontSize: 11 }} tickMargin={10} axisLine={{ stroke: '#333' }} tickLine={false} />
                      <YAxis domain={['auto', 'auto']} stroke="#333" tick={{ fill: '#737373', fontSize: 11 }} tickMargin={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '6px', fontSize: '12px', color: '#fff' }}
                        itemStyle={{ color: color }}
                        cursor={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '4 4' }}
                        formatter={(value: any) => [value, 'Projected']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={color} 
                        strokeWidth={2} 
                        dot={{ r: 3, fill: '#0d0d0d', strokeWidth: 2 }} 
                        activeDot={{ r: 5 }} 
                        label={{ position: 'top', fill: '#a3a3a3', fontSize: 10, dy: -8 }}
                      />
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

