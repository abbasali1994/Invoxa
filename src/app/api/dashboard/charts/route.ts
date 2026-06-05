import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentWorkspaceId } from '@/lib/workspace'

export const dynamic = 'force-dynamic'

function getLast6Months() {
  const result = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
    result.push({
      label: start.toLocaleString('en', { month: 'short' }),
      start,
      end,
    })
  }
  return result
}

export async function GET() {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const months = getLast6Months()
    const sixMonthsAgo = months[0].start

    // Fetch all settlements in range
    const settlements = await prisma.settlementRecord.findMany({
      where: {
        workspaceId,
        settledAt: { gte: sixMonthsAgo },
        status: { in: ['SETTLED', 'PARTIAL'] },
      },
      select: {
        settledAt: true,
        actualInrReceived: true,
        netRealized: true,
        exchangeRate: true,
      },
    })

    // Fetch all expenses in range
    const expenses = await prisma.expense.findMany({
      where: {
        workspaceId,
        date: { gte: sixMonthsAgo },
        deletedAt: null,
      },
      select: { date: true, amount: true, currency: true },
    })

    // Fetch all paid invoices in range with client
    const paidInvoices = await prisma.invoice.findMany({
      where: {
        workspaceId,
        status: 'PAID',
        paidAt: { gte: sixMonthsAgo },
        deletedAt: null,
      },
      include: { client: true },
      orderBy: { paidAt: 'asc' },
    })

    // ── CASHFLOW — strictly monthly ──────────────────────────
    const cashflow = months.map(({ label, start, end }) => {
      const monthSettlements = settlements.filter(s => {
        const d = new Date(s.settledAt!)
        return d >= start && d <= end
      })

      const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date)
        return d >= start && d <= end
      })

      const realizedRevenue = monthSettlements.reduce((sum, s) => {
        if (s.netRealized && s.exchangeRate && s.exchangeRate > 0) {
          return sum + s.netRealized / s.exchangeRate
        }
        if (s.actualInrReceived && s.exchangeRate && s.exchangeRate > 0) {
          return sum + s.actualInrReceived / s.exchangeRate
        }
        return sum + (s.netRealized || 0)
      }, 0)

      const totalExpenses = monthExpenses.reduce((sum, e) => {
        if (e.currency === 'INR') return sum + e.amount / 84
        return sum + e.amount
      }, 0)

      const profit = realizedRevenue - totalExpenses

      return {
        name: label,
        realizedRevenue: Math.round(realizedRevenue),
        expenses: Math.round(totalExpenses),
        profit: Math.round(profit),
      }
    })

    // ── REVENUE BY CLIENT — strictly monthly ─────────────────
    const clientSet = new Set<string>()
    const monthClientMap: Record<string, Record<string, number>> = {}

    for (const invoice of paidInvoices) {
      if (!invoice.paidAt || !invoice.client) continue
      const paidAt = new Date(invoice.paidAt)

      const matchedMonth = months.find(
        ({ start, end }) => paidAt >= start && paidAt <= end
      )
      if (!matchedMonth) continue

      const monthLabel = matchedMonth.label
      const clientName = invoice.client.name
      clientSet.add(clientName)

      if (!monthClientMap[monthLabel]) monthClientMap[monthLabel] = {}
      monthClientMap[monthLabel][clientName] =
        (monthClientMap[monthLabel][clientName] || 0) + invoice.total
    }

    const revenueMonths = months.map(({ label }) => ({
      month: label,
      ...(monthClientMap[label] || {}),
    }))

    const clients = Array.from(clientSet)

    // ── EXPENSE BREAKDOWN ────────────────────────────────────
    const allExpenses = await prisma.expense.findMany({
      where: { workspaceId, deletedAt: null },
      select: { category: true, amount: true },
    })

    const categoryMap: Record<string, number> = {}
    for (const expense of allExpenses) {
      const cat = expense.category || 'Other'
      categoryMap[cat] = (categoryMap[cat] || 0) + expense.amount
    }

    const expenseBreakdown = Object.entries(categoryMap)
      .map(([category, total]) => ({ category, total: Math.round(total) }))
      .sort((a, b) => b.total - a.total)

    return NextResponse.json({
      cashflow,
      revenueByClient: { months: revenueMonths, clients },
      expenseBreakdown,
    })
  } catch (error) {
    console.error('Dashboard charts error:', error)
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 })
  }
}
