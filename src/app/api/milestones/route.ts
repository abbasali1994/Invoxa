export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';
export async function GET() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const m = await prisma.milestone.findMany({ where: { project: { workspaceId } } });
  return NextResponse.json(m);
}
export async function POST(req: NextRequest) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const body = await req.json();
  const project = await prisma.project.findFirst({ where: { id: body.projectId, workspaceId }, select: { id: true } });
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const m = await prisma.milestone.create({ data: body });
  return NextResponse.json(m, { status: 201 });
}
