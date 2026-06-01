export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function GET() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const body = await req.json();
    const client = await prisma.client.create({ data: { ...body, workspaceId } });
    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
