export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const s = await prisma.settlementRecord.findFirst({ where: { id: (await params).id, workspaceId } });
  return NextResponse.json(s);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const id = (await params).id;
  const body = await req.json();
  const existingSettlement = await prisma.settlementRecord.findFirst({ where: { id, workspaceId } });
  if (!existingSettlement) return NextResponse.json({ error: 'Settlement not found' }, { status: 404 });

  const s = await prisma.settlementRecord.update({ where: { id }, data: body });
  return NextResponse.json(s);
}
