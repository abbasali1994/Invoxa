export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const id = (await params).id;
  
  const client = await prisma.client.findFirst({ 
    where: { id, workspaceId },
    include: { 
      invoices: {
        include: {
          settlements: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    } 
  });

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const recurringWorkflows = await prisma.recurringWorkflow.findMany({
    where: { clientId: id }
  });

  const totalRevenue = client.invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.total, 0);

  const totalInvoices = client.invoices.length;

  const outstandingAmount = client.invoices
    .filter(i => i.status === 'SENT' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.total, 0);

  const lastInvoice = client.invoices[0];
  const lastInvoiceDate = lastInvoice ? lastInvoice.createdAt : null;

  const upcomingInvoices = client.invoices
    .filter(i => i.status === 'SENT' || i.status === 'OVERDUE');

  const settlements = client.invoices
    .flatMap(i => i.settlements)
    .filter(Boolean);

  return NextResponse.json({
    ...client,
    totalRevenue,
    totalInvoices,
    outstandingAmount,
    lastInvoiceDate,
    recurringWorkflows,
    upcomingInvoices,
    settlements
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

  const id = (await params).id;
  const body = await req.json();
  const existingClient = await prisma.client.findFirst({ where: { id, workspaceId } });
  if (!existingClient) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  const client = await prisma.client.update({ where: { id }, data: body });
  return NextResponse.json(client);
}
