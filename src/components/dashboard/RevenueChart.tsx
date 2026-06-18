'use client'
import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts'

const CLIENT_COLORS = [
  '#818cf8', '#34d399', '#f472b6', '#fb923c', '#facc15',
  '#38bdf8', '#a78bfa', '#4ade80', '#f87171', '#e879f9'
]

export interface RevenueChartProps {
  data: Record<string, any>[]
  clients: string[]
}



export function RevenueChart({ data, clients }: RevenueChartProps) {
  const [activeData, setActiveData] = React.useState<{ label: string; payload: any[] } | null>(null)

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Revenue by Client</h3>
        <p className="text-sm text-neutral-500 mt-0.5">Monthly revenue breakdown per client</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            barCategoryGap="20%" 
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="month" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
            <RechartsTooltip 
              cursor={{ fill: '#1a1a1a' }}
              wrapperStyle={{ visibility: 'hidden', pointerEvents: 'none' }}
              content={({ active, payload, label }: any) => {
                React.useEffect(() => {
                  if (active && payload && payload.length) {
                    setActiveData(prev => {
                      if (prev?.label !== label) {
                        return { label, payload }
                      }
                      return prev
                    })
                  }
                }, [active, label])
                return null
              }}
            />
            {clients.map((clientName, index) => (
              <Bar
                key={clientName}
                dataKey={clientName}
                name={clientName}
                fill={CLIENT_COLORS[index % CLIENT_COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 min-h-[120px]">
        {activeData ? (
          <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl relative animate-in fade-in duration-300">
            <button 
              onClick={() => setActiveData(null)}
              className="absolute top-3 right-3 text-neutral-500 hover:text-white transition-colors p-1.5 rounded-md hover:bg-neutral-800"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            <p className="text-neutral-300 font-semibold mb-3">{activeData.label} Breakdown</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
              {activeData.payload.map((entry: any, index: number) => (
                <div key={index} className="flex justify-between items-center text-sm p-1.5 rounded-md hover:bg-neutral-900/50 transition-colors">
                  <span style={{ color: entry.color }} className="pr-2 leading-tight">{entry.name}</span>
                  <span style={{ color: entry.color }} className="font-semibold tabular-nums shrink-0">
                    ${entry.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 animate-in fade-in duration-300 px-4 py-2">
            {clients.map((clientName, index) => (
              <div key={clientName} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: CLIENT_COLORS[index % CLIENT_COLORS.length] }} 
                />
                <span className="text-sm text-neutral-400">{clientName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
