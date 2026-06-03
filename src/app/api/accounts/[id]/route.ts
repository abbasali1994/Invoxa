export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const account = await prisma.financialAccount.findFirst({ where: { id: (await params).id, workspaceId }, include: { debitEntries: true, creditEntries: true } });
  return NextResponse.json(account);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const id = (await params).id;
  const body = await req.json();
  const existingAccount = await prisma.financialAccount.findFirst({ where: { id, workspaceId } });
  if (!existingAccount) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const account = await prisma.financialAccount.update({ where: { id }, data: body });
  return NextResponse.json(account);
}
