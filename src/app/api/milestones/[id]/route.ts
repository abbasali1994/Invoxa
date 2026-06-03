export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const m = await prisma.milestone.findFirst({ where: { id: (await params).id, project: { workspaceId } } });
  return NextResponse.json(m);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const id = (await params).id;
  const body = await req.json();
  const existingMilestone = await prisma.milestone.findFirst({ where: { id, project: { workspaceId } } });
  if (!existingMilestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });

  const m = await prisma.milestone.update({ where: { id }, data: body });
  return NextResponse.json(m);
}
