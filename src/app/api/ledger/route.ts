export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';
export async function GET() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const ledger = await prisma.journalEntry.findMany({
    where: {
      OR: [
        { debitAccount: { workspaceId } },
        { creditAccount: { workspaceId } },
      ],
    },
    include: { debitAccount: true, creditAccount: true }
  });
  return NextResponse.json(ledger);
}
