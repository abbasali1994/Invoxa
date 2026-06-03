export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const id = (await params).id;
  const body = await req.json();
  const clients = await prisma.client.findMany({ where: { workspaceId }, select: { id: true } });
  const clientIds = clients.map((client) => client.id);
  const existingWorkflow = await prisma.recurringWorkflow.findFirst({
    where: { id, clientId: { in: clientIds } },
  });
  if (!existingWorkflow) return NextResponse.json({ error: 'Recurring workflow not found' }, { status: 404 });

  if (body.clientId && !clientIds.includes(body.clientId)) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const r = await prisma.recurringWorkflow.update({ where: { id }, data: body });
  return NextResponse.json(r);
}
