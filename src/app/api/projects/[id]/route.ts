export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id: (await params).id, workspaceId }, include: { milestones: true, expenses: true } });
  return NextResponse.json(project);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const id = (await params).id;
  const body = await req.json();
  const existingProject = await prisma.project.findFirst({ where: { id, workspaceId } });
  if (!existingProject) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const project = await prisma.project.update({ where: { id }, data: body });
  return NextResponse.json(project);
}
