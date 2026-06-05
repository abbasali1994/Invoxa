import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentWorkspaceId } from '@/lib/workspace'

export const dynamic = 'force-dynamic'

function get12Months() {
  const result = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
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

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const url = new URL(req.url);
    const revenuePeriod = url.searchParams.get('revenuePeriod');

    const months = get12Months()
    const earliestDate = months[0].start

    // Fetch all settlements in range
    const settlements = await prisma.settlementRecord.findMany({
      where: {
        workspaceId,
        settledAt: { gte: earliestDate },
        status: { in: ['SETTLED', 'PARTIAL'] },
      },
      select: {
        settledAt: true,
        actualInrReceived: true,
        netRealized: true,
        exchangeRate: true,
        invoice: { include: { client: true } },
      },
    })

    // Fetch all expenses in range
    const expenses = await prisma.expense.findMany({
      where: {
        workspaceId,
        date: { gte: earliestDate },
        deletedAt: null,
      },
      select: { date: true, amount: true, currency: true },
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

    // ── REVENUE BY CLIENT — filtered optionally by month ─────
    let revenueMonthsFilter = months;
    if (revenuePeriod && revenuePeriod.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = revenuePeriod.split('-').map(Number);
      const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const end = new Date(year, month, 1, 0, 0, 0, -1);
      revenueMonthsFilter = [{
        label: start.toLocaleString('en', { month: 'short' }),
        start,
        end,
      }];
    }

    const clientSet = new Set<string>()
    const monthClientMap: Record<string, Record<string, number>> = {}

    for (const settlement of settlements) {
      if (!settlement.settledAt || !settlement.invoice?.client) continue
      const settledAt = new Date(settlement.settledAt)

      const matchedMonth = revenueMonthsFilter.find(
        ({ start, end }) => settledAt >= start && settledAt <= end
      )
      if (!matchedMonth) continue

      const monthLabel = matchedMonth.label
      const clientName = settlement.invoice.client.name
      clientSet.add(clientName)

      if (!monthClientMap[monthLabel]) monthClientMap[monthLabel] = {}
      
      // Calculate revenue (USD equivalent)
      let revenue = 0;
      if (settlement.netRealized && settlement.exchangeRate && settlement.exchangeRate > 0) {
        revenue = settlement.netRealized / settlement.exchangeRate;
      } else if (settlement.actualInrReceived && settlement.exchangeRate && settlement.exchangeRate > 0) {
        revenue = settlement.actualInrReceived / settlement.exchangeRate;
      } else {
        revenue = settlement.netRealized || 0;
      }

      monthClientMap[monthLabel][clientName] =
        (monthClientMap[monthLabel][clientName] || 0) + revenue
    }

    const revenueMonthsData = revenueMonthsFilter.map(({ label }) => ({
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
      revenueByClient: { months: revenueMonthsData, clients },
      expenseBreakdown,
    })
  } catch (error) {
    console.error('Dashboard charts error:', error)
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 })
  }
}
