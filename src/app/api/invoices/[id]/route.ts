export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { enforcePermission } from '@/lib/permission-check';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const invoice = await prisma.invoice.findFirst({
      where: { id: (await params).id, workspaceId, deletedAt: null },
      include: { client: true, settlements: { orderBy: { settledAt: 'asc' } } }
    });
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const body = await request.json();
    const id = (await params).id;
    const existingInvoice = await prisma.invoice.findFirst({ where: { id, workspaceId, deletedAt: null } });
    if (!existingInvoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Strip fields not present in the Invoice model
    const { date, paymentTerms, clientName, client, settlements, createdAt, updatedAt, deletedAt, workspaceId: _ws, createdById, ...updateData } = body;

    if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);
    if (date) updateData.createdAt = new Date(date);

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
    });

    if (body.status === 'PAID') {
      let arAccount = await prisma.financialAccount.findFirst({ where: { name: 'Accounts Receivable', workspaceId } });
      if (!arAccount) arAccount = await prisma.financialAccount.create({ data: { name: 'Accounts Receivable', type: 'BANK', currency: 'USD', workspaceId } });
      let revenueAccount = await prisma.financialAccount.findFirst({ where: { name: 'Sales Revenue', workspaceId } });
      if (!revenueAccount) revenueAccount = await prisma.financialAccount.create({ data: { name: 'Sales Revenue', type: 'BANK', currency: 'USD', workspaceId } });
      
      await prisma.journalEntry.create({
        data: {
          date: new Date(),
          description: `Revenue recognized for Invoice ${invoice.invoiceNumber}`,
          debitAccountId: arAccount.id,
          creditAccountId: revenueAccount.id,
          amount: invoice.total,
          currency: invoice.currency,
          referenceType: 'INVOICE',
          referenceId: invoice.id
        }
      });
    }

    await logAction('Invoice', invoice.id, 'UPDATED', body);

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const denied = await enforcePermission('invoice.delete');
    if (denied) return denied;

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const id = (await params).id;
    const inv = await prisma.invoice.findFirst({ where: { id, workspaceId } });
    if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (inv.status === 'DRAFT') {
      await prisma.invoice.delete({ where: { id } });
      await logAction('Invoice', id, 'HARD_DELETED');
    } else {
      await prisma.invoice.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      await logAction('Invoice', id, 'SOFT_DELETED');
    }



    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
