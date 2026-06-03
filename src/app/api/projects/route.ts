export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';
import { getCurrentWorkspaceId } from '@/lib/workspace';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  budget: z.number().optional(),
  currency: z.string().default('USD'),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.ACTIVE),
});

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    const projects = await prisma.project.findMany({
      where: clientId ? { workspaceId, clientId } : { workspaceId },
      include: {
        client: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 });

    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);
    const client = await prisma.client.findFirst({
      where: { id: validatedData.clientId, workspaceId },
      select: { id: true },
    });
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const project = await prisma.project.create({
      data: { ...validatedData, workspaceId },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).errors }, { status: 400 });
    }
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
