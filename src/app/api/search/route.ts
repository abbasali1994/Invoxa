export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ clients: [], invoices: [], expenses: [] });
    }

    const [clients, invoices, expenses] = await Promise.all([
      prisma.client.findMany({
        where: { workspaceId, name: { contains: query } },
        take: 5
      }),
      prisma.invoice.findMany({
        where: {
          workspaceId,
          deletedAt: null,
          OR: [
            { invoiceNumber: { contains: query } },
            { client: { name: { contains: query } } }
          ]
        },
        include: { client: true },
        take: 5
      }),
      prisma.expense.findMany({
        where: { workspaceId, deletedAt: null, vendor: { contains: query } },
        take: 5
      })
    ]);

    return NextResponse.json({ clients, invoices, expenses });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
