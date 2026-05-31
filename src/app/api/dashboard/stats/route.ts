export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total invoiced USD (current month)
    const invoicedCurrentMonth = await prisma.invoice.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: firstDayOfMonth },
        currency: 'USD'
      }
    });

    // Realized INR & Settlement Gap
    const realizedData = await prisma.settlementRecord.aggregate({
      _sum: { actualInrReceived: true, settlementGap: true }
    });

    // Pending settlements
    const pendingSettlements = await prisma.invoice.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: { status: { in: ['SENT', 'OVERDUE'] } }
    });

    // Outstanding receivables
    const outstandingReceivables = await prisma.invoice.aggregate({
      _sum: { total: true },
      where: { status: { in: ['SENT', 'OVERDUE'] }, currency: 'USD' }
    });

    return NextResponse.json({
      invoicedCurrentMonthUSD: invoicedCurrentMonth._sum.total || 0,
      totalInvoicedUSD: await prisma.invoice.aggregate({ _sum: { total: true } }).then(res => res._sum.total || 0),
      realizedINR: realizedData._sum.actualInrReceived || 0,
      totalSettlementGap: realizedData._sum.settlementGap || 0,
      pendingSettlementsCount: pendingSettlements._count.id || 0,
      pendingSettlementsUSD: pendingSettlements._sum.total || 0,
      outstandingReceivablesUSD: outstandingReceivables._sum.total || 0,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
