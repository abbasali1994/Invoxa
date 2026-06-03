export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';
export async function GET() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const clients = await prisma.client.findMany({ where: { workspaceId }, select: { id: true } });
  const templates = await prisma.invoiceTemplate.findMany({
    where: { clientId: { in: clients.map((client) => client.id) } },
  });
  return NextResponse.json(templates);
}
export async function POST(req: NextRequest) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const body = await req.json();
  if (body.clientId) {
    const client = await prisma.client.findFirst({ where: { id: body.clientId, workspaceId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  } else {
    return NextResponse.json({ error: 'Client is required for workspace templates' }, { status: 400 });
  }

  const template = await prisma.invoiceTemplate.create({ data: body });
  return NextResponse.json(template, { status: 201 });
}
