export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enforcePermission } from '@/lib/permission-check';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const id = (await params).id;
    const expense = await prisma.expense.findFirst({
      where: { id, workspaceId, deletedAt: null },
      include: {
        account: true
      }
    });

    if (!expense) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const denied = await enforcePermission('expense.delete');
    if (denied) return denied;

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const id = (await params).id;
    const expense = await prisma.expense.findFirst({ where: { id, workspaceId } });
    
    if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (expense.status === 'DRAFT') {
      await prisma.expense.delete({ where: { id } });
    } else {
      await prisma.expense.update({ where: { id }, data: { deletedAt: new Date() } });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const id = (await params).id;
    const body = await request.json();
    const existingExpense = await prisma.expense.findFirst({ where: { id, workspaceId, deletedAt: null } });
    if (!existingExpense) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        vendor: body.vendor,
        expenseNumber: body.expenseNumber,
        amount: body.amount,
        subtotal: body.subtotal,
        total: body.total,
        date: body.date ? new Date(body.date) : undefined,
        category: body.category,
        currency: body.currency,
        accountId: body.accountId,
        status: body.status,
        isRecurring: body.isRecurring,
        paymentMethod: body.paymentMethod,
        notes: body.notes,
        lineItems: body.lineItems,
        receiptUrl: body.receiptUrl,
      }
    });
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
