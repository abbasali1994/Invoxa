import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentWorkspaceId } from '@/lib/workspace'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)

    const [invoicedThisMonth, realizedINR, pendingInvoices, outstandingReceivables, settlementGap] =
      await Promise.all([
        prisma.invoice.aggregate({
          where: { workspaceId, createdAt: { gte: startOfMonth }, deletedAt: null },
          _sum: { total: true },
        }).catch(() => ({ _sum: { total: 0 } })),

        prisma.settlementRecord.aggregate({
          where: { workspaceId, status: { in: ['SETTLED', 'PARTIAL'] } },
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
