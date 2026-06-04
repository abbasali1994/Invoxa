export const dynamic = 'force-dynamic';

import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDFDocument } from '@/components/InvoicePDFDocument';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return new NextResponse('No active workspace', { status: 401 });

    const id = (await params).id;
    const invoice = await prisma.invoice.findFirst({
      where: { id, workspaceId, deletedAt: null },
      include: { client: true }
    });

    if (!invoice) {
      return new NextResponse('Invoice not found', { status: 404 });
    }

    const buffer = await renderToBuffer(
      <InvoicePDFDocument data={invoice} clientName={invoice.client.name} />
    );

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber || id}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return new NextResponse('Internal Server Error generating PDF', { status: 500 });
  }
}
