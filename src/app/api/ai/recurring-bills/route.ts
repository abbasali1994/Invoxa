export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';
export async function GET() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const expenses = await prisma.expense.findMany({ where: { workspaceId, createdAt: { gte: new Date(Date.now() - 90 * 86400000) } }});
  return NextResponse.json({ bills: [] }); // Stub logic for brevity
}
