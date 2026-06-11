export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentWorkspaceId } from '@/lib/workspace'

function getFYMonths(baseDate: Date = new Date()) {
  let startYear = baseDate.getFullYear()
  if (baseDate.getMonth() < 3) {
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

import { PAYMENT_METHOD_ALIASES, PaymentMethod } from '@/lib/paymentMethods'

const BANK_METHODS = PAYMENT_METHOD_ALIASES[PaymentMethod.BANK_TRANSFER].map(v => v.toUpperCase())
const CRYPTO_METHODS = PAYMENT_METHOD_ALIASES[PaymentMethod.CRYPTO].map(v => v.toUpperCase())
const CASH_METHODS = PAYMENT_METHOD_ALIASES[PaymentMethod.CASH].map(v => v.toUpperCase())

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
      where: {
        ...(workspaceId ? { workspaceId } : {}),
        ...(dateFilter ? { settledAt: dateFilter } : {})
      },
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
        paymentMethod: { in: PAYMENT_METHOD_ALIASES[PaymentMethod.CRYPTO] },
        status: { in: ['SENT', 'OVERDUE'] },
        deletedAt: null,
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      select: { total: true, createdAt: true },
    })
    const cryptoUnsettled = cryptoInvoices.reduce((sum, inv) => sum + inv.total, 0)

    // Yearly chart — based on the selected date range's FY
    const baseDate = fromParam ? new Date(fromParam + 'T00:00:00') : new Date()
    const months = getFYMonths(baseDate)
    const yearlyData = months.map(({ label, start, end }) => {
      const inRangeSettlements = settlements.filter(s => {
        if (!s.settledAt) return false
        const d = new Date(s.settledAt)
        return d >= start && d <= end
      })

      const inRangeCrypto = cryptoInvoices.filter(inv => {
        const d = new Date(inv.createdAt)
        return d >= start && d <= end
      })

      return {
        month: label,
        bankTransfer: Math.round(inRangeSettlements
          .filter(s => BANK_METHODS.includes(s.paymentMethod?.toUpperCase() || ''))
          .reduce((sum, s) => sum + (s.actualInrReceived || 0), 0)),
        crypto: Math.round(inRangeCrypto.reduce((sum, inv) => sum + inv.total, 0)),
        cash: Math.round(inRangeSettlements
          .filter(s => CASH_METHODS.includes(s.paymentMethod?.toUpperCase() || ''))
          .reduce((sum, s) => sum + (s.actualInrReceived || 0), 0)),
      }
    })

    // Monthly chart — weeks for each month of the current FY
    const allMonthsWeeklyData = months.map(({ label, year, month }) => {
      const weeks = getMonthWeeks(year, month)
      const weeksData = weeks.map((w) => {
        const inRangeSettlements = settlements.filter(s => {
          if (!s.settledAt) return false
          const d = new Date(s.settledAt)
          return d >= w.start && d <= w.end
        })

        const inRangeCrypto = cryptoInvoices.filter(inv => {
          const d = new Date(inv.createdAt)
          return d >= w.start && d <= w.end
        })

        return {
          month: w.label,
          bankTransfer: Math.round(inRangeSettlements
            .filter(s => BANK_METHODS.includes(s.paymentMethod?.toUpperCase() || ''))
            .reduce((sum, s) => sum + (s.actualInrReceived || 0), 0)),
          crypto: Math.round(inRangeCrypto.reduce((sum, inv) => sum + inv.total, 0)),
          cash: Math.round(inRangeSettlements
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
