export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/workspace — all workspaces for current user
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { invitedAt: 'asc' },
  })

  const workspaces = memberships.map((m) => ({
    id: m.workspaceId,
    name: m.workspace.name,
    slug: m.workspace.slug,
    role: m.role,
    memberCount: m.workspace._count.members,
    ownerId: m.workspace.ownerId,
    createdAt: m.workspace.createdAt,
  }))

  return NextResponse.json(workspaces)
}

// POST /api/workspace — create new workspace
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`

  const workspace = await prisma.workspace.create({
    data: {
      name: name.trim(),
      slug,
      ownerId: session.user.id,
      members: {
        create: { userId: session.user.id, role: 'ADMIN' },
      },
    },
  })

  return NextResponse.json(workspace, { status: 201 })
}
