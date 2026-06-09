export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const dateFrom = from ? new Date(from + 'T00:00:00') : undefined;
    const dateTo = to ? new Date(to + 'T23:59:59') : undefined;
    const hasDateFilter = !!(dateFrom && dateTo);

    const baseWhere: any = { deletedAt: null, workspaceId };
    if (hasDateFilter) {
      baseWhere.createdAt = { gte: dateFrom, lte: dateTo };
    }

    const [allCount, sentCount, paidCount, overdueCount, draftCount, totalCount] = await Promise.all([
      prisma.invoice.count({ where: baseWhere }),
      prisma.invoice.count({ where: { ...baseWhere, status: 'SENT' } }),
      prisma.invoice.count({ where: { ...baseWhere, status: 'PAID' } }),
      prisma.invoice.count({ where: { ...baseWhere, status: 'OVERDUE' } }),
      prisma.invoice.count({ where: { ...baseWhere, status: 'DRAFT' } }),
      prisma.invoice.count({ where: { workspaceId } }),
    ]);

    return NextResponse.json({
      all: allCount,
      sent: sentCount,
      paid: paidCount,
      overdue: overdueCount,
      draft: draftCount,
      nextNumber: `INV-${new Date().getFullYear()}-${String(totalCount + 1).padStart(4, '0')}`
    });
  } catch (error) {
    console.error('Error fetching invoice counts:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice counts' }, { status: 500 });
  }
}
