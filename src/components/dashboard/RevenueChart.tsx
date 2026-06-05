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
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="text-lg font-medium mb-1">Revenue by Client (6mo)</h3>
      <p className="text-sm text-neutral-500 mb-4">Monthly revenue breakdown per client</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%" barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="month" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
            <RechartsTooltip
              cursor={{ fill: '#1a1a1a' }}
              contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', color: '#fff' }}
              formatter={(value: any, name: any) => {
                if (typeof value === 'number') {
                  return [`$${value.toLocaleString()}`, name]
                }
                return [value, name]
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
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
    </div>
  )
}
