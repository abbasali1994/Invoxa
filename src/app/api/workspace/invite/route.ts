export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// POST /api/workspace/invite — invite user by email to workspace
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { workspaceId, email, role } = await req.json()
  if (!workspaceId || !email) return NextResponse.json({ error: 'workspaceId and email required' }, { status: 400 })

  // Check invoker is ADMIN of that workspace
  const invokerMembership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!invokerMembership || invokerMembership.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can invite members' }, { status: 403 })
  }

  // Find invitee user
  const invitee = await prisma.user.findUnique({ where: { email } })
  if (!invitee) return NextResponse.json({ error: 'No user with that email found. They must log in first.' }, { status: 404 })

  // Check if already a member
  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: invitee.id } },
  })
  if (existing) return NextResponse.json({ error: 'User is already a member' }, { status: 409 })

  const member = await prisma.workspaceMember.create({
    data: { workspaceId, userId: invitee.id, role: role ?? 'EDITOR' },
    include: { user: true },
  })

  return NextResponse.json({ success: true, member }, { status: 201 })
}
