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
  revenuePeriod: string
  setRevenuePeriod: (p: string) => void
}

function generateMonthOptions() {
  const options = [{ value: '12mo', label: 'Last 12 Months' }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    options.push({ value, label });
  }
  return options;
}

export function RevenueChart({ data, clients, revenuePeriod, setRevenuePeriod }: RevenueChartProps) {
  const monthOptions = React.useMemo(() => generateMonthOptions(), []);

  const selectedLabel = revenuePeriod === '12mo' 
    ? '(12mo)' 
    : `(${monthOptions.find(o => o.value === revenuePeriod)?.label})`;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-lg font-medium">Revenue by Client {selectedLabel}</h3>
        <select 
          value={revenuePeriod} 
          onChange={(e) => setRevenuePeriod(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 text-xs rounded px-2 py-1 outline-none text-neutral-300 focus:ring-1 focus:ring-indigo-500"
        >
          {monthOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
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
                  return [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, name]
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
