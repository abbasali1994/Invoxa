export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';
export async function GET(req: NextRequest) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const unread = searchParams.get('unread') === 'true';
  if (unread) {
    const count = await prisma.notification.count({ where: { workspaceId, isRead: false } });
    return NextResponse.json({ count });
  }
  const n = await prisma.notification.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' }, take: 10 });
  return NextResponse.json(n);
}
