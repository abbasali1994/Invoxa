export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { sendWorkspaceInvite } from '@/lib/email'
import { logAction } from '@/lib/audit'
import crypto from 'crypto'

// POST /api/workspace/invite — invite user by email to workspace
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { workspaceId, email, role } = await req.json()
  if (!workspaceId || !email) return NextResponse.json({ error: 'workspaceId and email required' }, { status: 400 })

  const invokerMembership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    include: { workspace: true }
  })
  if (!invokerMembership || invokerMembership.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can invite members' }, { status: 403 })
  }

  // Check if already a member
  const invitee = await prisma.user.findUnique({ where: { email } })
  if (invitee) {
    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: invitee.id } },
    })
    if (existing) return NextResponse.json({ error: 'User is already a member' }, { status: 409 })
  }

  // Check if invitation already exists
  const existingInvite = await prisma.workspaceInvitation.findUnique({
    where: { email_workspaceId: { email, workspaceId } }
  })
  if (existingInvite && ['PENDING'].includes(existingInvite.status)) {
    return NextResponse.json({ error: 'Invitation already sent and pending' }, { status: 409 })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  const invitation = await prisma.workspaceInvitation.upsert({
    where: { email_workspaceId: { email, workspaceId } },
    create: {
      email,
      workspaceId,
      role: role ?? 'EDITOR',
      token,
      invitedById: session.user.id,
      expiresAt,
      lastSentAt: new Date(),
      status: 'PENDING'
    },
    update: {
      role: role ?? 'EDITOR',
      token,
      invitedById: session.user.id,
      expiresAt,
      lastSentAt: new Date(),
      status: 'PENDING'
    }
  })

  // Send email
  const inviteLink = `${process.env.AUTH_URL}/login?invite=${token}`
  await sendWorkspaceInvite(
    email,
    invokerMembership.workspace.name,
    session.user.name || session.user.email || 'An admin',
    invitation.role,
    7,
    inviteLink
  )

  // Audit log
  await logAction('WORKSPACE', workspaceId, 'Invitation Created', { email, role: invitation.role }, session.user.id)

  return NextResponse.json({ success: true, invitation }, { status: 201 })
}
