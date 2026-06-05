import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentWorkspaceId } from '@/lib/workspace'

export const dynamic = 'force-dynamic'

function getMonthsInRange(from: string | null, to: string | null) {
  const now = new Date();
  const start = from
    ? new Date(from + 'T00:00:00')
    : new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0);
  const end = to ? new Date(to + 'T23:59:59') : now;

  const result: { label: string; start: Date; end: Date }[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cur <= end) {
    const monthStart = new Date(cur.getFullYear(), cur.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0, 23, 59, 59, 999);
    result.push({
      label: cur.toLocaleString('en', { month: 'short', year: '2-digit' }),
      start: monthStart,
      end: new Date(Math.min(monthEnd.getTime(), end.getTime())),
    });
    cur.setMonth(cur.getMonth() + 1);
  }
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const url = new URL(req.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    const months = getMonthsInRange(from, to);
    const earliestDate = months[0]?.start ?? new Date(0);
    const latestDate = months[months.length - 1]?.end ?? new Date();

    // Fetch settlements and expenses within the range
    const [settlements, expenses] = await Promise.all([
      prisma.settlementRecord.findMany({
        where: {
          workspaceId,
          settledAt: { gte: earliestDate, lte: latestDate },
          status: { in: ['SETTLED', 'PARTIAL'] },
        },
        select: {
          settledAt: true,
          actualInrReceived: true,
          netRealized: true,
          exchangeRate: true,
          invoice: { include: { client: true } },
        },
      }),
      prisma.expense.findMany({
        where: {
          workspaceId,
          date: { gte: earliestDate, lte: latestDate },
          deletedAt: null,
        },
        select: { date: true, amount: true, currency: true },
      }),
    ]);

    // ── CASHFLOW ─────────────────────────────────────────────
    const cashflow = months.map(({ label, start, end }) => {
      const monthSettlements = settlements.filter(s => {
        const d = new Date(s.settledAt!);
        return d >= start && d <= end;
      });
      const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });

      const realizedRevenue = monthSettlements.reduce((sum, s) => {
        if (s.netRealized && s.exchangeRate && s.exchangeRate > 0)
          return sum + s.netRealized / s.exchangeRate;
        if (s.actualInrReceived && s.exchangeRate && s.exchangeRate > 0)
          return sum + s.actualInrReceived / s.exchangeRate;
        return sum + (s.netRealized || 0);
      }, 0);

      const totalExpenses = monthExpenses.reduce((sum, e) => {
        return sum + (e.currency === 'INR' ? e.amount / 84 : e.amount);
      }, 0);

      return {
        name: label,
        realizedRevenue: Math.round(realizedRevenue),
        expenses: Math.round(totalExpenses),
        profit: Math.round(realizedRevenue - totalExpenses),
      };
    });

    // ── REVENUE BY CLIENT ─────────────────────────────────────
    const clientSet = new Set<string>();
    const monthClientMap: Record<string, Record<string, number>> = {};

    for (const settlement of settlements) {
      if (!settlement.settledAt || !settlement.invoice?.client) continue;
      const settledAt = new Date(settlement.settledAt);

      const matchedMonth = months.find(({ start, end }) => settledAt >= start && settledAt <= end);
      if (!matchedMonth) continue;

      const clientName = settlement.invoice.client.name;
      clientSet.add(clientName);

      if (!monthClientMap[matchedMonth.label]) monthClientMap[matchedMonth.label] = {};

      let revenue = 0;
      if (settlement.netRealized && settlement.exchangeRate && settlement.exchangeRate > 0) {
        revenue = settlement.netRealized / settlement.exchangeRate;
      } else if (settlement.actualInrReceived && settlement.exchangeRate && settlement.exchangeRate > 0) {
        revenue = settlement.actualInrReceived / settlement.exchangeRate;
      } else {
        revenue = settlement.netRealized || 0;
      }

      monthClientMap[matchedMonth.label][clientName] =
        (monthClientMap[matchedMonth.label][clientName] || 0) + revenue;
    }

    const revenueMonthsData = months.map(({ label }) => ({
      month: label,
      ...(monthClientMap[label] || {}),
    }));

    // ── EXPENSE BREAKDOWN ─────────────────────────────────────
    const allExpenses = await prisma.expense.findMany({
      where: { workspaceId, deletedAt: null },
      select: { category: true, amount: true },
    });

    const categoryMap: Record<string, number> = {};
    for (const expense of allExpenses) {
      const cat = expense.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + expense.amount;
    }

    const expenseBreakdown = Object.entries(categoryMap)
      .map(([category, total]) => ({ category, total: Math.round(total) }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      cashflow,
      revenueByClient: { months: revenueMonthsData, clients: Array.from(clientSet) },
      expenseBreakdown,
    });
  } catch (error) {
    console.error('Dashboard charts error:', error);
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}
