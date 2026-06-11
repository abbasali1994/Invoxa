import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function GET() {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const all = await prisma.expense.count({ where: { workspaceId, deletedAt: null } });
    const saved = await prisma.expense.count({ where: { workspaceId, status: 'SAVED', deletedAt: null } });
    const draft = await prisma.expense.count({ where: { workspaceId, status: 'DRAFT', deletedAt: null } });
    const recurring = await prisma.expense.count({ where: { workspaceId, isRecurring: true, deletedAt: null } });

    // For overdue, let's find recurring expenses whose date is older than 30 days.
    // In a real app, this would use the nextRunAt logic from recurring workflows, 
    // but the expense model only has a boolean `isRecurring`. 
    // We'll estimate "overdue" as expenses that are marked recurring and are older than 30 days 
    // (assuming monthly recurrence) without a newer expense for the same vendor.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // We'll just do a rough query to simulate the logic for now:
    const overdue = await prisma.expense.count({ 
      where: { 
        isRecurring: true, 
        date: { lt: thirtyDaysAgo }, 
        workspaceId,
        deletedAt: null 
      } 
    });

    const totalCount = await prisma.expense.count({ where: { workspaceId } });

    return NextResponse.json({
      all,
      saved,
      draft,
      recurring,
      overdue,
      nextNumber: `EXP-${new Date().getFullYear()}-${String(totalCount + 1).padStart(4, '0')}`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch counts' }, { status: 500 });
  }
}
