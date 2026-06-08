export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';
import { SettlementStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const dateFrom = from ? new Date(from + 'T00:00:00') : undefined;
  const dateTo = to ? new Date(to + 'T23:59:59') : undefined;
  const hasDateFilter = !!(dateFrom && dateTo);
  console.log("Fetching dashboard stats with date filter:", hasDateFilter ? `${dateFrom} to ${dateTo}` : "none");
  const entries: any[] = [];

  // All non-draft invoices, each joined to their latest settled settlement
  const invoices = await prisma.invoice.findMany({
    where: {
      workspaceId,
      deletedAt: null,
      status: { not: 'DRAFT' },
      ...(hasDateFilter ? { OR: [
        { paidAt: { gte: dateFrom, lte: dateTo } },
        { createdAt: { gte: dateFrom, lte: dateTo } }] } : {}),
    },
    include: {
      client: { select: { name: true } },
      settlements: {
        where: { status: SettlementStatus.SETTLED },
        orderBy: { settledAt: 'desc' },
        take: 1,
      },
    },
  });

  for (const inv of invoices) {
    const settlement = inv.settlements[0] ?? null;
    entries.push({
      id: `invoice-${inv.id}`,
      date: (settlement?.settledAt ?? inv.paidAt ?? inv.createdAt).toISOString(),
      type: 'INCOME',
      description: inv.invoiceNumber,
      clientOrVendor: inv.client?.name ?? '',
      category: null,
      inflowUSD: inv.total,
      inflowINR: settlement?.actualInrReceived ?? null,
      outflow: null,
      sourceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      status: inv.status,
      isSettled: !!settlement,
      exchangeRate: settlement?.exchangeRate ?? null,
      paymentMethod: settlement?.paymentMethod ?? null,
    });
  }

  const expenses = await prisma.expense.findMany({
    where: {
      workspaceId,
      deletedAt: null,
      status: 'SAVED',
      ...(hasDateFilter ? { date: { gte: dateFrom, lte: dateTo } } : {}),
    },
  });

  for (const e of expenses) {
    entries.push({
      id: `expense-${e.id}`,
      date: e.date?.toISOString() ?? new Date().toISOString(),
      type: 'EXPENSE',
      description: e.vendor,
      clientOrVendor: e.vendor,
      category: e.category,
      inflowUSD: null,
      inflowINR: null,
      outflow: e.amount,
      sourceId: e.id,
      invoiceNumber: null,
      isSettled: null,
      paymentMethod: e.paymentMethod,
    });
  }

  // Sort oldest-first, compute running net using INR inflow only
  entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let running = 0;
  for (const entry of entries) {
    if (entry.type === 'INCOME') running += entry.inflowINR ?? 0;
    else running -= entry.outflow ?? 0;
    entry.runningNet = running;
  }

  entries.reverse();

  const totalInflowUSD = invoices.reduce((s, inv) => s + (inv.total ?? 0), 0);
  const totalInflowINR = invoices.reduce((s, inv) => s + (inv.settlements[0]?.actualInrReceived ?? 0), 0);
  const totalOutflow = expenses.reduce((s, e) => s + (e.amount ?? 0), 0);
  const settledCount = invoices.filter(inv => inv.settlements.length > 0).length;

  return NextResponse.json({
    entries,
    summary: {
      totalInflowUSD,
      totalInflowINR,
      totalOutflow,
      netIncome: totalInflowINR - totalOutflow,
      invoiceCount: invoices.length,
      settledCount,
      expenseCount: expenses.length,
    },
  });
}
