'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface AccountsBarChartProps {
  yearlyData: { month: string; bankTransfer: number; crypto: number; cash: number }[]
  allMonthsWeeklyData: {
    monthName: string
    weeks: { month: string; bankTransfer: number; crypto: number; cash: number }[]
  }[]
}

const COLORS = {
  bankTransfer: '#818cf8',  // indigo
  crypto: '#fbbf24',        // amber
  cash: '#34d399',          // emerald
}

export function AccountsBarChart({ yearlyData, allMonthsWeeklyData }: AccountsBarChartProps) {
  const data = yearlyData;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'white', margin: 0 }}>
            Receipts by Payment Method
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#737373', margin: '0.25rem 0 0' }}>
            Combined view across all accounts
          </p>
        </div>
      </div>

      <div style={{ height: '280px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="25%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis
              dataKey="month"
              stroke="#737373"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#737373"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v >= 100000 ? `${(v/100000).toFixed(1)}L` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              cursor={{ fill: '#1a1a1a' }}
              contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', color: '#fff', borderRadius: '8px' }}
              formatter={(value) => [
                `₹${(value as number).toLocaleString('en-IN')}`
              ]}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => value === 'bankTransfer' ? 'Bank Transfer' : value === 'crypto' ? 'Crypto' : 'Cash'}
            />
            <Bar dataKey="bankTransfer" name="bankTransfer" fill={COLORS.bankTransfer} radius={[4, 4, 0, 0]} />
            <Bar dataKey="crypto" name="crypto" fill={COLORS.crypto} radius={[4, 4, 0, 0]} />
            <Bar dataKey="cash" name="cash" fill={COLORS.cash} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
