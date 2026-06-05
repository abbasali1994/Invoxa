export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Decimal from 'decimal.js';
import { enforcePermission } from '@/lib/permission-check';
import { getCurrentWorkspaceId } from '@/lib/workspace';
import { SettlementStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    // RBAC: Only ADMINs can record settlements
    const denied = await enforcePermission('settlement.create');
    if (denied) return denied;

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const body = await req.json();
    const {
      invoiceId,
      actualInrReceived,
      exchangeRate,
      paymentMethod,
      receivingAccountId,
      settlementDate,
      deductions,
      notes
    } = body;

    // Validation
    const invoice = await prisma.invoice.findFirst({ 
      where: { id: invoiceId, workspaceId },
      include: { client: true, settlements: { orderBy: { settledAt: 'desc' } } }
    });
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    if (invoice.status === 'CANCELLED') return NextResponse.json({ error: 'Cannot settle cancelled invoice' }, { status: 400 });
    if (!actualInrReceived || actualInrReceived <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

    let account = null;
    if (receivingAccountId) {
      account = await prisma.financialAccount.findFirst({ where: { id: receivingAccountId, workspaceId } });
      if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Calculate settlement fields using decimal.js
    const invoiceUSD = new Decimal(invoice.total);
    const rate = new Decimal(exchangeRate);
    const actualINR = new Decimal(actualInrReceived);
    const deductionsAmount = new Decimal(deductions || 0);
    
    const expectedINR = invoiceUSD.times(rate);
    const settlementGap = expectedINR.minus(actualINR);
    const netRealized = actualINR.minus(deductionsAmount);

    const existingSettlement = invoice.settlements[0];
    const settlementStatus = SettlementStatus.SETTLED;

    // Run everything in a Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      
      const settlementData = {
        invoiceId,
        invoicedUSD: invoice.total,
        receivedUSD: actualINR.dividedBy(rate).toNumber(),
        realizedINR: actualINR.toNumber(),
        exchangeRate: rate.toNumber(),
        platformFee: deductionsAmount.toNumber(),
        netRealized: netRealized.toNumber(),
        settledAt: new Date(settlementDate),
        status: settlementStatus,
        notes,
        actualInrReceived: actualINR.toNumber(),
        settlementGap: settlementGap.toNumber(),
        paymentMethod,
        receivingAccountId: receivingAccountId || null,
        workspaceId,
      };

      const settlement = existingSettlement
        ? await tx.settlementRecord.update({
            where: { id: existingSettlement.id },
            data: settlementData
          })
        : await tx.settlementRecord.create({ data: settlementData });

      // 2. Update invoice status
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { 
          status: 'PAID',
          paidAt: new Date(settlementDate)
        }
      });

      // 3. Find or create double-entry accounts
      let receivableAccount = await tx.financialAccount.findFirst({
        where: { type: 'EXPENSE', name: { contains: 'Receivable' }, workspaceId }
      });
      if (!receivableAccount) {
        receivableAccount = await tx.financialAccount.create({
          data: { name: 'Accounts Receivable', type: 'EXPENSE', currency: 'USD', balance: 0, workspaceId }
        });
      }

      if (receivingAccountId && !existingSettlement) {
        // 4. Create journal entry (Debit receiving account, Credit accounts receivable)
        await tx.journalEntry.create({
          data: {
            date: new Date(settlementDate),
            description: `Settlement for Invoice ${invoice.invoiceNumber} - ${invoice.client.name}`,
            debitAccountId: receivingAccountId,
            creditAccountId: receivableAccount.id,
            amount: netRealized.toNumber(),
            currency: 'INR',
            referenceType: 'settlement',
            referenceId: settlement.id,
          }
        });

        // 5. Update receiving account balance
        await tx.financialAccount.update({
          where: { id: receivingAccountId },
          data: { 
            balance: { increment: netRealized.toNumber() }
          }
        });
      }

      // 6. Create audit log
      await tx.auditLog.create({
        data: {
          entityType: 'Settlement',
          entityId: settlement.id,
          action: existingSettlement ? 'UPDATED' : 'CREATED',
          changedFields: {
            invoiceId,
            actualInrReceived: actualINR.toNumber(),
            exchangeRate: rate.toNumber(),
            settlementGap: settlementGap.toNumber(),
            paymentMethod,
            receivingAccount: account ? account.name : null,
            status: settlementStatus
          }
        }
      });

      return settlement;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in settlement:', error);
    return NextResponse.json({ error: 'Failed to record settlement' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const dateFilter = from && to
      ? { settledAt: { gte: new Date(from + 'T00:00:00'), lte: new Date(to + 'T23:59:59') } }
      : {};

    const settlements = await prisma.settlementRecord.findMany({
      where: { workspaceId, ...dateFilter },
      orderBy: { settledAt: 'desc' },
      include: {
        invoice: { include: { client: true } },
        receivingAccount: true
      }
    });
    return NextResponse.json(settlements);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settlements' }, { status: 500 });
  }
}
