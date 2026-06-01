export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const [allCount, sentCount, paidCount, overdueCount, draftCount] = await Promise.all([
      prisma.invoice.count({ where: { deletedAt: null, workspaceId } }),
      prisma.invoice.count({ where: { deletedAt: null, status: 'SENT', workspaceId } }),
      prisma.invoice.count({ where: { deletedAt: null, status: 'PAID', workspaceId } }),
      prisma.invoice.count({ where: { deletedAt: null, status: 'OVERDUE', workspaceId } }),
      prisma.invoice.count({ where: { deletedAt: null, status: 'DRAFT', workspaceId } }),
    ]);

    return NextResponse.json({
      all: allCount,
      sent: sentCount,
      paid: paidCount,
      overdue: overdueCount,
      draft: draftCount
    });
  } catch (error) {
    console.error('Error fetching invoice counts:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice counts' }, { status: 500 });
  }
}
