export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';
import { getCurrentWorkspaceId, getSession } from '@/lib/workspace';
import { parseInvoiceDate } from '@/lib/date-format';

const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  lineItems: z.array(
    z.object({
      description: z.string(),
      hours: z.number().optional(),
      cost: z.number().optional(),
      amount: z.number().optional(),
      isSection: z.boolean().optional()
    })
  ),
  subtotal: z.number(),
  tax: z.number().optional(),
  total: z.number(),
  currency: z.string().default('USD'),
  status: z.nativeEnum(InvoiceStatus).default(InvoiceStatus.DRAFT),
  dueDate: z.string().optional().transform(val => parseInvoiceDate(val)),
  notes: z.string().optional(),
  templateId: z.string().optional(),
  senderName: z.string().optional(),
  billToCompany: z.string().optional(),
  paymentMethod: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  swiftCode: z.string().optional(),
  invoiceNumber: z.string().optional(),
  date: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const dateFrom = from ? new Date(from + 'T00:00:00') : undefined;
    const dateTo = to ? new Date(to + 'T23:59:59') : undefined;
    const hasDateFilter = !!(dateFrom && dateTo);

    let whereClause: any = { deletedAt: null, workspaceId };

    if (hasDateFilter) {
      whereClause.createdAt = { gte: dateFrom, lte: dateTo };
    }

    if (statusParam && statusParam !== 'ALL' && statusParam !== 'active') {
      whereClause.status = statusParam.toUpperCase();
    } else if (statusParam === 'active') {
      whereClause.status = { not: 'DRAFT' };
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        client: { select: { name: true, email: true } },
        createdBy: { select: { name: true, email: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const session = await getSession();
    const body = await request.json();
    const validatedData = createInvoiceSchema.parse(body);
    const client = await prisma.client.findFirst({
      where: { id: validatedData.clientId, workspaceId },
      select: { id: true },
    });
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const invoiceDate = validatedData.date ? new Date(validatedData.date) : new Date();

    let invoiceNumber = validatedData.invoiceNumber;
    if (!invoiceNumber) {
      const count = await prisma.invoice.count({ where: { workspaceId } });
      invoiceNumber = `INV-${invoiceDate.getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    const { date, invoiceNumber: _reqInvNumber, ...restData } = validatedData;

    const invoice = await prisma.invoice.create({
      data: {
        ...restData,
        invoiceNumber,
        createdAt: invoiceDate,
        workspaceId,
        createdById: session?.user?.id,
        lineItems: validatedData.lineItems,
      },
      include: { client: true, createdBy: { select: { name: true, email: true, image: true } } }
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).errors }, { status: 400 });
    }
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
