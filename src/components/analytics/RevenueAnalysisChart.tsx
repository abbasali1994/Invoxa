import React, { useMemo } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts'
import { format, parseISO, addMonths, startOfMonth } from 'date-fns'

interface Props {
  rawData?: any
  invoices?: any // For backward compatibility if needed
}

function linearRegression(y: number[]) {
  const n = y.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  if (n === 1) return { slope: 0, intercept: y[0] };
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += y[i];
    sumXY += i * y[i];
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function RevenueAnalysisChart({ rawData, invoices: oldInvoices }: Props) {
  const chartData = useMemo(() => {
    // Determine data source
    let invoices = oldInvoices || []
    let expenses = []
    let settlements = []

    if (rawData) {
      invoices = rawData.invoices || []
      expenses = rawData.expenses || []
      settlements = rawData.settlements || []
    }
    const fxRates = rawData?.fxRates || {}

    if (invoices.length === 0 && expenses.length === 0) return []

    // 1. Group historical data by month
    const monthlyData: Record<string, {
      monthStr: string,
      date: Date,
      revenueUSD: number,
      expenseINR: number,
      exchangeRates: number[]
    }> = {}

    invoices.forEach((inv: any) => {
      try {
        const d = parseISO(inv.createdAt)
        const monthKey = format(d, 'yyyy-MM')
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { monthStr: format(d, 'MMM yy'), date: startOfMonth(d), revenueUSD: 0, expenseINR: 0, exchangeRates: [] }
        }
        monthlyData[monthKey].revenueUSD += (inv.total || 0)
      } catch (e) {}
    })

    expenses.forEach((exp: any) => {
      try {
        const d = parseISO(exp.date)
        const monthKey = format(d, 'yyyy-MM')
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { monthStr: format(d, 'MMM yy'), date: startOfMonth(d), revenueUSD: 0, expenseINR: 0, exchangeRates: [] }
        }
        if (exp.currency === 'USD') {
          monthlyData[monthKey].expenseINR += (exp.amount || 0) * 84 // fallback
        } else {
          monthlyData[monthKey].expenseINR += (exp.amount || 0)
        }
      } catch (e) {}
    })

    settlements.forEach((settle: any) => {
      if (!settle.settledAt || !settle.exchangeRate) return;
      try {
        const d = parseISO(settle.settledAt)
        const monthKey = format(d, 'yyyy-MM')
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { monthStr: format(d, 'MMM yy'), date: startOfMonth(d), revenueUSD: 0, expenseINR: 0, exchangeRates: [] }
        }
        // If we don't have real API FX rates, fall back to DB settlement rates
        if (!fxRates || Object.keys(fxRates).length === 0) {
          monthlyData[monthKey].exchangeRates.push(settle.exchangeRate)
        }
      } catch (e) {}
    })

    // If we have API FX rates, distribute them into their respective months
    if (fxRates && Object.keys(fxRates).length > 0) {
      Object.keys(fxRates).forEach(dateStr => {
        const monthKey = dateStr.substring(0, 7); // "YYYY-MM"
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].exchangeRates.push(fxRates[dateStr].INR)
        }
      })
    }

    const sortedMonths = Object.values(monthlyData).sort((a, b) => a.date.getTime() - b.date.getTime())

    if (sortedMonths.length === 0) return []

    // 2. Compute historical actuals
    let lastKnownRate = 84;
    const historical = sortedMonths.map(m => {
      let avgRate = lastKnownRate;
      if (m.exchangeRates.length > 0) {
        avgRate = m.exchangeRates.reduce((a, b) => a + b, 0) / m.exchangeRates.length;
        lastKnownRate = avgRate;
      }
      return {
        name: m.monthStr,
        date: m.date,
        revenue: m.revenueUSD,
        expense: m.expenseINR / avgRate, // Expense factored by exchange rate (converted to USD)
        exchangeRate: avgRate,
        isPrediction: false
      }
    })

    // 3. Linear Regression using historical range ONLY
    const revModel = linearRegression(historical.map(h => h.revenue))
    const expModel = linearRegression(historical.map(h => h.expense))
    const fxModel = linearRegression(historical.map(h => h.exchangeRate))

    const n = historical.length;
    
    // 4. Generate Predictions for the next 6 months
    const lastDate = historical[n - 1].date;
    const predictions = [];

    // Link point so the chart is continuous
    historical[n - 1] = {
      ...historical[n - 1],
      predictedRevenue: historical[n - 1].revenue,
      predictedExpense: historical[n - 1].expense,
      predictedExchangeRate: historical[n - 1].exchangeRate,
    } as any

    for (let i = 1; i <= 6; i++) {
      const predDate = addMonths(lastDate, i)
      const fx = fxModel.slope * (n - 1 + i) + fxModel.intercept
      const predictedFX = Math.max(fx, 50) 
      
      const rev = revModel.slope * (n - 1 + i) + revModel.intercept
      const exp = expModel.slope * (n - 1 + i) + expModel.intercept
      
      predictions.push({
        name: format(predDate, 'MMM yy'),
        date: predDate,
        predictedRevenue: Math.max(0, rev),
        predictedExpense: Math.max(0, exp),
        predictedExchangeRate: predictedFX,
        isPrediction: true
      })
    }

    return [...historical, ...predictions]
  }, [rawData, oldInvoices])

  const lastHistoricalMonthName = useMemo(() => {
    if (chartData.length === 0) return ''
    const historical = chartData.filter((d: any) => !d.isPrediction)
    if (historical.length === 0) return ''
    return historical[historical.length - 1].name
  }, [chartData])

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 h-full flex flex-col relative overflow-hidden">
      {/* Background ambient glow matching premium theme */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1 font-semibold">Predictive AI Modeling</p>
          <h3 className="text-white text-lg font-bold">Historical Revenue & Expense Growth</h3>
          <p className="text-neutral-400 text-sm mt-1">
            Exchange-rate factored predictions for the next 6 months.
          </p>
        </div>
      </div>
      
      {chartData.length > 0 ? (
        <div style={{ width: '100%', height: '360px', marginTop: '1rem' }} className="relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPredRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPredExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb7185" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#525252" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
                minTickGap={20}
              />
              <YAxis 
                yAxisId="left"
                stroke="#525252" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                dx={-10}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#525252" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `₹${value.toFixed(1)}`}
                dx={10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                formatter={(value: any, name: any, props: any) => {
                  const num = Number(value)
                  
                  // Modify name for cleaner tooltip
                  let label = name
                  if (name === 'revenue') label = 'Historical Revenue'
                  if (name === 'expense') label = 'Historical Expense'
                  if (name === 'predictedRevenue') label = 'Predicted Revenue'
                  if (name === 'predictedExpense') label = 'Predicted Expense'
                  if (name === 'exchangeRate') label = 'avg dollar value'
                  if (name === 'predictedExchangeRate') label = 'predicted avg dollar value'

                  if (name === 'avg dollar value' || name === 'predicted avg dollar value') {
                    return [`₹${num.toFixed(2)}`, label]
                  }

                  const formatted = `$${isNaN(num) ? 0 : num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  return [formatted, label]
                }}
                labelStyle={{ color: '#a3a3a3', marginBottom: '8px', fontWeight: 'bold' }}
                itemStyle={{ padding: '2px 0' }}
                cursor={{ stroke: '#525252', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }} 
                iconType="circle"
              />

              {/* Historical Areas */}
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                name="Historical Revenue"
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRev)" 
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#171717' }}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="expense" 
                name="Historical Expense"
                stroke="#f43f5e" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorExp)" 
                dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#171717' }}
                activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="exchangeRate"
                name="avg dollar value"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={{ r: 4, fill: '#60a5fa', strokeWidth: 2, stroke: '#171717' }}
                activeDot={{ r: 6, fill: '#60a5fa', stroke: '#fff', strokeWidth: 2 }}
              />

              {/* Boundary Line matching Image 3 vertical dotted line */}
              {lastHistoricalMonthName && (
                <ReferenceLine 
                  yAxisId="left"
                  x={lastHistoricalMonthName} 
                  stroke="#a3a3a3" 
                  strokeDasharray="3 3" 
                  label={{ position: 'top', value: 'Today', fill: '#a3a3a3', fontSize: 12, dy: -10 }} 
                />
              )}

              {/* Prediction Areas */}
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="predictedRevenue" 
                name="Predicted Revenue"
                stroke="#34d399" 
                strokeWidth={3}
                strokeDasharray="5 5"
                fillOpacity={1} 
                fill="url(#colorPredRev)" 
                dot={false}
                activeDot={{ r: 6, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="predictedExpense" 
                name="Predicted Expense"
                stroke="#fb7185" 
                strokeWidth={3}
                strokeDasharray="5 5"
                fillOpacity={1} 
                fill="url(#colorPredExp)" 
                dot={false}
                activeDot={{ r: 6, fill: '#fb7185', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="predictedExchangeRate"
                name="predicted avg dollar value"
                stroke="#93c5fd"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 6, fill: '#93c5fd', stroke: '#fff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm relative z-10">
          No data available for the selected period to generate predictions.
        </div>
      )}
    </div>
  )
}
