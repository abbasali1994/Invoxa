export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentWorkspaceId } from '@/lib/workspace'

function getCurrentFYMonths() {
  const now = new Date()
  let startYear = now.getFullYear()
  if (now.getMonth() < 3) {
    startYear -= 1
  }
  const result = []
  for (let i = 0; i < 12; i++) {
    const start = new Date(startYear, 3 + i, 1, 0, 0, 0, 0)
    const end = new Date(startYear, 3 + i + 1, 0, 23, 59, 59, 999)
    result.push({
      label: start.toLocaleString('en', { month: 'short' }),
      year: start.getFullYear(),
      month: start.getMonth(),
      start,
      end,
    })
  }
  return result
}

function getMonthWeeks(year: number, month: number) {
  return [
    { label: 'Week 1', start: new Date(year, month, 1), end: new Date(year, month, 7, 23, 59, 59, 999) },
    { label: 'Week 2', start: new Date(year, month, 8), end: new Date(year, month, 14, 23, 59, 59, 999) },
    { label: 'Week 3', start: new Date(year, month, 15), end: new Date(year, month, 21, 23, 59, 59, 999) },
    { label: 'Week 4', start: new Date(year, month, 22), end: new Date(year, month + 1, 0, 23, 59, 59, 999) },
  ]
}

const BANK_METHODS = ['BANK_TRANSFER']
const CRYPTO_METHODS = ['CRYPTO']
const CASH_METHODS = ['CASH']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    const dateFilter = fromParam && toParam ? {
      gte: new Date(fromParam + 'T00:00:00'),
      lte: new Date(toParam + 'T23:59:59'),
    } : undefined

    const workspaceId = await getCurrentWorkspaceId()

    const settlements = await prisma.settlementRecord.findMany({
      where: dateFilter ? { settledAt: dateFilter } : undefined,
      select: {
        paymentMethod: true,
        actualInrReceived: true,
        settledAt: true,
        status: true,
      },
    })

    // Card totals
    const bankTotal = settlements
      .filter(s => BANK_METHODS.includes(s.paymentMethod?.toUpperCase() || ''))
      .reduce((sum, s) => sum + (s.actualInrReceived || 0), 0)

    const cashTotal = settlements
      .filter(s => CASH_METHODS.includes(s.paymentMethod?.toUpperCase() || ''))
      .reduce((sum, s) => sum + (s.actualInrReceived || 0), 0)

    // Crypto: invoices sent/overdue with CRYPTO payment method (USD total)
    const cryptoInvoices = await prisma.invoice.findMany({
      where: {
        ...(workspaceId ? { workspaceId } : {}),
        paymentMethod: { in: CRYPTO_METHODS },
        status: { in: ['SENT', 'OVERDUE'] },
        deletedAt: null,
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      select: { total: true },
    })
    const cryptoUnsettled = cryptoInvoices.reduce((sum, inv) => sum + inv.total, 0)

    // Yearly chart — current FY
    const months = getCurrentFYMonths()
    const yearlyData = months.map(({ label, start, end }) => {
      const inRange = settlements.filter(s => {
        if (!s.settledAt) return false
        const d = new Date(s.settledAt)
        return d >= start && d <= end
      })

      return {
        month: label,
        bankTransfer: Math.round(inRange
          .filter(s => BANK_METHODS.includes(s.paymentMethod?.toUpperCase() || ''))
          .reduce((sum, s) => sum + (s.actualInrReceived || 0), 0)),
        crypto: Math.round(inRange
          .filter(s => CRYPTO_METHODS.includes(s.paymentMethod?.toUpperCase() || ''))
          .reduce((sum, s) => sum + (s.actualInrReceived || 0), 0)),
        cash: Math.round(inRange
          .filter(s => CASH_METHODS.includes(s.paymentMethod?.toUpperCase() || ''))
          .reduce((sum, s) => sum + (s.actualInrReceived || 0), 0)),
      }
    })

    // Monthly chart — weeks for each month of the current FY
    const allMonthsWeeklyData = months.map(({ label, year, month }) => {
      const weeks = getMonthWeeks(year, month)
      const weeksData = weeks.map((w) => {
        const inRange = settlements.filter(s => {
          if (!s.settledAt) return false
          const d = new Date(s.settledAt)
          return d >= w.start && d <= w.end
        })

        return {
          month: w.label,
          bankTransfer: Math.round(inRange
            .filter(s => BANK_METHODS.includes(s.paymentMethod?.toUpperCase() || ''))
            .reduce((sum, s) => sum + (s.actualInrReceived || 0), 0)),
          crypto: Math.round(inRange
            .filter(s => CRYPTO_METHODS.includes(s.paymentMethod?.toUpperCase() || ''))
            .reduce((sum, s) => sum + (s.actualInrReceived || 0), 0)),
          cash: Math.round(inRange
            .filter(s => CASH_METHODS.includes(s.paymentMethod?.toUpperCase() || ''))
            .reduce((sum, s) => sum + (s.actualInrReceived || 0), 0)),
        }
      })
      
      return {
        monthName: label,
        weeks: weeksData
      }
    })

    return NextResponse.json({
      cards: { bankTotal, cryptoUnsettled, cashTotal },
      yearlyData,
      allMonthsWeeklyData,
    })
  } catch (error) {
    console.error('Accounts summary error:', error)
    return NextResponse.json({ error: 'Failed to fetch account summary' }, { status: 500 })
  }
}
