'use client'
import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts'

export interface CashflowDataPoint {
  name: string
  realizedRevenue: number
  expenses: number
  profit: number
}

export interface CashflowChartProps {
  data: CashflowDataPoint[]
}

export function CashflowChart({ data }: CashflowChartProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="text-lg font-medium mb-4">Cashflow Overview</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="name" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
            <RechartsTooltip
              contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', color: '#fff' }}
              formatter={(value: any, name: any) => {
                if (typeof value === 'number') {
                  return [`₹${value.toLocaleString('en-IN')}`, name]
                }
                return [value, name]
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="realizedRevenue" name="Realized Revenue" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f472b6" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="profit" name="Profit" stroke="#a78bfa" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
