export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { getCurrentWorkspaceId } from '@/lib/workspace';
import { enforcePermission } from '@/lib/permission-check';

export async function GET() {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const accounts = await prisma.financialAccount.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const denied = await enforcePermission('account.create');
    if (denied) return denied;

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const body = await request.json();

    const account = await prisma.financialAccount.create({
      data: {
        name: body.name,
        type: body.type,
        currency: body.currency,
        balance: body.balance || 0,
        walletAddress: body.walletAddress,
        workspaceId,
      }
    });

    await logAction('FinancialAccount', account.id, 'CREATED', body);
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
