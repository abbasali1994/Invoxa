export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';
import { getCurrentWorkspaceId, getSession } from '@/lib/workspace';

const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  lineItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      rate: z.number(),
      amount: z.number()
    })
  ),
  subtotal: z.number(),
  tax: z.number().optional(),
  total: z.number(),
  currency: z.string().default('USD'),
  status: z.nativeEnum(InvoiceStatus).default(InvoiceStatus.DRAFT),
  dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
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
});

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    let whereClause: any = { deletedAt: null, workspaceId };

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

    const count = await prisma.invoice.count({ where: { workspaceId } });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        ...validatedData,
        invoiceNumber,
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
