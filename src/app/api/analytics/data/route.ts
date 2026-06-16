import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workspaceId = cookies().get('active_workspace_id')?.value
  if (!workspaceId) return NextResponse.json({ error: 'No workspace selected' }, { status: 400 })

  // 1. Fetch Invoices
  const invoices = await prisma.invoice.findMany({
    where: { workspaceId, deletedAt: null },
    select: {
      id: true, invoiceNumber: true, total: true, currency: true, status: true,
      dueDate: true, paidAt: true, client: { select: { name: true } },
      createdAt: true
    }
  })

  // 2. Fetch Expenses
  const expenses = await prisma.expense.findMany({
    where: { workspaceId, deletedAt: null },
    select: {
      id: true, amount: true, currency: true, category: true,
      date: true, status: true, vendor: true, paymentMethod: true
    }
  })

  // 3. Fetch Settlements (helps calculate FX Loss and Margins)
  const settlements = await prisma.settlementRecord.findMany({
    where: { workspaceId },
    select: {
      id: true, invoicedUSD: true, receivedUSD: true, realizedINR: true,
      exchangeRate: true, platformFee: true, transferFee: true, status: true,
      settledAt: true
    }
  })

  // 4. Fetch Account Balances
  const accounts = await prisma.financialAccount.findMany({
    where: { workspaceId, isActive: true },
    select: { id: true, name: true, type: true, balance: true, currency: true }
  })

  // Basic pre-computation to pass to Gemini
  const summary = {
    totalInvoices: invoices.length,
    totalExpenses: expenses.length,
    totalSettlements: settlements.length,
    totalAccounts: accounts.length,
    invoiceVolume: invoices.reduce((sum, inv) => sum + inv.total, 0),
    expenseVolume: expenses.reduce((sum, exp) => sum + exp.amount, 0),
  }

  return NextResponse.json({
    summary,
    data: { invoices, expenses, settlements, accounts }
  })
}
