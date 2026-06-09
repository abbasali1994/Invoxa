'use client'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ChevronDown } from 'lucide-react'

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
  const [period, setPeriod] = useState<string>('yearly')

  let data: any[] = []
  if (period === 'yearly') {
    data = yearlyData
  } else {
    const monthData = allMonthsWeeklyData.find(m => m.monthName === period)
    if (monthData) {
      data = monthData.weeks
    }
  }

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
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setPeriod('yearly')}
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              borderRadius: '6px',
              border: '1px solid',
              cursor: 'pointer',
              borderColor: period === 'yearly' ? '#6366f1' : '#404040',
              background: period === 'yearly' ? '#6366f1' : 'transparent',
              color: 'white',
              height: '28px',
            }}
          >
            Current FY
          </button>
          
          <div style={{ position: 'relative' }}>
            <select
              value={period === 'yearly' ? 'default' : period}
              onChange={(e) => {
                if (e.target.value !== 'default') {
                  setPeriod(e.target.value)
                }
              }}
              style={{
                padding: '0.25rem 1.75rem 0.25rem 0.75rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                border: '1px solid',
                cursor: 'pointer',
                borderColor: period !== 'yearly' ? '#6366f1' : '#404040',
                background: period !== 'yearly' ? '#6366f1' : 'transparent',
                color: 'white',
                appearance: 'none',
                height: '28px',
                outline: 'none',
              }}
            >
              <option value="default" disabled style={{ background: '#1a1a1a', color: 'white' }}>Select Month</option>
              {allMonthsWeeklyData?.map((m) => (
                <option key={m.monthName} value={m.monthName} style={{ background: '#1a1a1a', color: 'white' }}>
                  {m.monthName}
                </option>
              ))}
            </select>
            <ChevronDown 
              size={14} 
              style={{ 
                position: 'absolute', 
                right: '6px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                pointerEvents: 'none',
                color: 'white'
              }} 
            />
          </div>
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
