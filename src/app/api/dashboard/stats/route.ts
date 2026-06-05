import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentWorkspaceId } from '@/lib/workspace'

export const dynamic = 'force-dynamic'

function getPeriodDates(period: string | null): { start: Date, end: Date } {
  const now = new Date();
  if (period && period.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = period.split('-').map(Number);
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 1, 0, 0, 0, 0); // start of next month
    return { start, end };
  }
  
  // Default to current-fy (April 1st to now)
  const currentMonth = now.getMonth(); // 0-11
  let startYear = now.getFullYear();
  if (currentMonth < 3) { // Jan, Feb, Mar are part of previous year's FY
    startYear -= 1;
  }
  const start = new Date(startYear, 3, 1, 0, 0, 0, 0); // April 1st
  const end = new Date(now);
  return { start, end };
}

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const url = new URL(req.url);
    const invoicedPeriod = url.searchParams.get('invoicedPeriod');
    const realizedPeriod = url.searchParams.get('realizedPeriod');

    const invoicedDates = getPeriodDates(invoicedPeriod);
    const realizedDates = getPeriodDates(realizedPeriod);

    const [invoicedThisMonth, realizedINR, pendingInvoices, outstandingReceivables, settlementGap] =
      await Promise.all([
        prisma.invoice.aggregate({
          where: { 
            workspaceId, 
            createdAt: { gte: invoicedDates.start, lt: invoicedDates.end }, 
            deletedAt: null 
          },
          _sum: { total: true },
        }).catch(() => ({ _sum: { total: 0 } })),

        prisma.settlementRecord.aggregate({
          where: { 
            workspaceId, 
            status: { in: ['SETTLED', 'PARTIAL'] },
            settledAt: { gte: realizedDates.start, lt: realizedDates.end }
          },
          _sum: { actualInrReceived: true },
        }).catch(() => ({ _sum: { actualInrReceived: 0 } })),

        prisma.invoice.findMany({
          where: { workspaceId, status: { in: ['SENT', 'OVERDUE'] }, deletedAt: null },
          select: { total: true },
        }).catch(() => []),

        prisma.invoice.aggregate({
          where: { workspaceId, status: 'OVERDUE', deletedAt: null },
          _sum: { total: true },
        }).catch(() => ({ _sum: { total: 0 } })),

        prisma.settlementRecord.aggregate({
          where: { workspaceId },
          _sum: { settlementGap: true },
        }).catch(() => ({ _sum: { settlementGap: 0 } })),
      ])

    return NextResponse.json({
      totalInvoicedUSD: invoicedThisMonth._sum.total || 0,
      totalRealizedINR: realizedINR._sum.actualInrReceived || 0,
      pendingSettlements: {
        count: pendingInvoices.length,
        usdValue: pendingInvoices.reduce((sum, i) => sum + i.total, 0),
      },
      outstandingReceivables: outstandingReceivables._sum.total || 0,
      totalSettlementGap: settlementGap._sum.settlementGap || 0,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
