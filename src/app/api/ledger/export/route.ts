export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';
export async function GET() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const entries = await prisma.journalEntry.findMany({
    where: {
      OR: [
        { debitAccount: { workspaceId } },
        { creditAccount: { workspaceId } },
      ],
    },
    include: { debitAccount: true, creditAccount: true }
  });
  const csv = "Date,Description,Debit Account,Credit Account,Amount,Currency\n" + 
    entries.map(e => `${e.date.toISOString()},${e.description},${e.debitAccount.name},${e.creditAccount.name},${e.amount},${e.currency}`).join("\n");
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv' }});
}
