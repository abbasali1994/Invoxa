export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';
import { enforcePermission } from '@/lib/permission-check';
import Decimal from 'decimal.js';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const s = await prisma.settlementRecord.findFirst({ where: { id: (await params).id, workspaceId } });
  return NextResponse.json(s);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await enforcePermission('settlement.create');
  if (denied) return denied;

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const id = (await params).id;
  const body = await req.json();
  const existingSettlement = await prisma.settlementRecord.findFirst({
    where: { id, workspaceId },
    include: { invoice: true }
  });
  if (!existingSettlement) return NextResponse.json({ error: 'Settlement not found' }, { status: 404 });

  const {
    actualInrReceived,
    exchangeRate,
    paymentMethod,
    receivingAccountId,
    settlementDate,
    deductions,
    notes
  } = body;

  if (!actualInrReceived || actualInrReceived <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

  let account = null;
  if (receivingAccountId) {
    account = await prisma.financialAccount.findFirst({ where: { id: receivingAccountId, workspaceId } });
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const invoiceUSD = new Decimal(existingSettlement.invoice.total);
  const rate = new Decimal(exchangeRate);
  const actualINR = new Decimal(actualInrReceived);
  const deductionsAmount = new Decimal(deductions || 0);
  const expectedINR = invoiceUSD.times(rate);
  const settlementGap = expectedINR.minus(actualINR);
  const netRealized = actualINR.minus(deductionsAmount);

  const s = await prisma.$transaction(async (tx) => {
    const settlement = await tx.settlementRecord.update({
      where: { id },
      data: {
        invoicedUSD: existingSettlement.invoice.total,
        receivedUSD: actualINR.dividedBy(rate).toNumber(),
        realizedINR: actualINR.toNumber(),
        exchangeRate: rate.toNumber(),
        platformFee: deductionsAmount.toNumber(),
        netRealized: netRealized.toNumber(),
        settledAt: new Date(settlementDate),
        status: 'SETTLED',
        notes,
        actualInrReceived: actualINR.toNumber(),
        settlementGap: settlementGap.toNumber(),
        paymentMethod,
        receivingAccountId: receivingAccountId || null,
      }
    });

    await tx.invoice.update({
      where: { id: existingSettlement.invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(settlementDate)
      }
    });

    await tx.auditLog.create({
      data: {
        entityType: 'Settlement',
        entityId: settlement.id,
        action: 'UPDATED',
        changedFields: {
          invoiceId: existingSettlement.invoiceId,
          actualInrReceived: actualINR.toNumber(),
          exchangeRate: rate.toNumber(),
          settlementGap: settlementGap.toNumber(),
          paymentMethod,
          receivingAccount: account ? account.name : null,
          status: 'SETTLED'
        }
      }
    });

    return settlement;
  });

  return NextResponse.json(s);
}
