import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentWorkspaceId } from '@/lib/workspace'

export const dynamic = 'force-dynamic'

function parseDateRange(from: string | null, to: string | null): { start: Date; end: Date } {
  if (from && to) {
    return {
      start: new Date(from + 'T00:00:00'),
      end: new Date(to + 'T23:59:59'),
    };
  }
  // Default: current Indian FY (April 1 → today)
  const now = new Date();
  const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return {
    start: new Date(fyStartYear, 3, 1, 0, 0, 0, 0),
    end: now,
  };
}

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const url = new URL(req.url);
    const { start, end } = parseDateRange(url.searchParams.get('from'), url.searchParams.get('to'));

    const [invoicedThisMonth, realizedINR, pendingInvoices, fxData] =
      await Promise.all([
        prisma.invoice.aggregate({
          where: {
            workspaceId,
            createdAt: { gte: start, lte: end },
            deletedAt: null,
          },
          _sum: { total: true },
        }).catch(() => ({ _sum: { total: 0 } })),

        prisma.settlementRecord.aggregate({
          where: {
            workspaceId,
            status: { in: ['SETTLED', 'PARTIAL'] },
            settledAt: { gte: start, lte: end },
          },
          _sum: { actualInrReceived: true },
        }).catch(() => ({ _sum: { actualInrReceived: 0 } })),

        prisma.invoice.findMany({
          where: {
            workspaceId,
            status: { in: ['SENT', 'OVERDUE'] },
            createdAt: { gte: start, lte: end },
            deletedAt: null,
          },
          select: { total: true },
        }).catch(() => []),

        fetch('https://api.frankfurter.app/latest?from=USD&to=INR')
          .then(r => r.json())
          .catch(() => null),
      ]);

    const usdToInr: number = fxData?.rates?.INR ?? 83.5;
    const pendingUSD = pendingInvoices.reduce((sum, i) => sum + i.total, 0);

    return NextResponse.json({
      totalInvoicedUSD: invoicedThisMonth._sum.total || 0,
      totalRealizedINR: realizedINR._sum.actualInrReceived || 0,
      pendingSettlements: {
        count: pendingInvoices.length,
        usdValue: pendingUSD,
        inrValue: pendingUSD * usdToInr,
        usdToInrRate: usdToInr,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
