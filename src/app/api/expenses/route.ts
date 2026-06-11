export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function POST(request: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const body = await request.json();
    if (body.accountId) {
      const account = await prisma.financialAccount.findFirst({
        where: { id: body.accountId, workspaceId },
        select: { id: true },
      });
      if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }


    const dateObj = new Date(body.date);
    const sevenDaysAgo = new Date(dateObj.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysFuture = new Date(dateObj.getTime() + 7 * 24 * 60 * 60 * 1000);

    let expenseNumber = body.expenseNumber;
    if (!expenseNumber) {
      const count = await prisma.expense.count({ where: { workspaceId } });
      expenseNumber = `EXP-${dateObj.getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    const amountNum = parseFloat(body.amount);
    const lowerBound = amountNum * 0.95;
    const upperBound = amountNum * 1.05;

    const duplicates = await prisma.expense.findMany({
      where: {
        workspaceId,
        vendor: { equals: body.vendor },
        date: { gte: sevenDaysAgo, lte: sevenDaysFuture },
        amount: { gte: lowerBound, lte: upperBound }
      }
    });

    const expense = await prisma.expense.create({
      data: {
        vendor: body.vendor,
        expenseNumber: expenseNumber,
        amount: amountNum,
        subtotal: body.subtotal,
        total: body.total,
        date: dateObj,
        category: body.category,
        currency: body.currency || 'USD',
        accountId: body.accountId || undefined,
        status: body.status || 'SAVED',
        isRecurring: body.isRecurring || false,
        paymentMethod: body.paymentMethod || undefined,
        notes: body.notes || undefined,
        lineItems: body.lineItems || [],
        aiCategorized: false,
        workspaceId,
      }
    });

    await logAction('Expense', expense.id, 'CREATED', body);

    // Auto-create Journal Entry scoped to workspace
    let expenseAccount = await prisma.financialAccount.findFirst({ where: { type: 'EXPENSE', workspaceId } });
    if (!expenseAccount) expenseAccount = await prisma.financialAccount.create({ data: { name: 'General Expenses', type: 'EXPENSE', currency: 'USD', workspaceId } });

    let bankAccount = await prisma.financialAccount.findFirst({ where: { type: 'BANK', workspaceId } });
    if (!bankAccount) bankAccount = await prisma.financialAccount.create({ data: { name: 'Main Bank', type: 'BANK', currency: 'USD', workspaceId } });

    await prisma.journalEntry.create({
      data: {
        date: dateObj,
        description: `Expense: ${body.vendor}`,
        debitAccountId: expenseAccount.id,
        creditAccountId: bankAccount.id,
        amount: amountNum,
        currency: body.currency || 'USD',
        referenceType: 'EXPENSE',
        referenceId: expense.id,
        expenseId: expense.id
      }
    });

    if (duplicates.length > 0) {
      return NextResponse.json({
        ...expense,
        duplicateWarning: true,
        duplicateIds: duplicates.map(d => d.id)
      }, { status: 201 });
    }

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const isRecurring = url.searchParams.get('isRecurring') === 'true';
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    let where: any = { deletedAt: null, workspaceId };

    if (isRecurring) {
      where.isRecurring = true;
    } else if (status && status !== 'active') {
      where.status = status;
    }

    if (from && to) {
      where.date = { gte: new Date(from), lte: new Date(to) };
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { account: true }
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
