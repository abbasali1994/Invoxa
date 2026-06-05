export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { ExpensePDFDocument } from '@/components/ExpensePDFDocument';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return new NextResponse('No active workspace', { status: 401 });

    const id = (await params).id;
    const expense = await prisma.expense.findFirst({
      where: { id, workspaceId },
      include: {
        account: true
      }
    });

    if (!expense) {
      return new NextResponse('Expense not found', { status: 404 });
    }

    const buffer = await renderToBuffer(<ExpensePDFDocument expense={expense} />);

    const dateObj = new Date(expense.date);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const safeVendorName = (expense.vendor || 'expense').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${safeVendorName}-${month}-${year}.pdf`;

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse('Internal Server Error generating PDF', { status: 500 });
  }
}
