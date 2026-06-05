export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentWorkspaceId } from '@/lib/workspace'
import { sendWorkspaceInvite } from '@/lib/email'
import { logAction } from '@/lib/audit'
import crypto from 'crypto'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const workspaceId = await getCurrentWorkspaceId()
    if (!workspaceId) return NextResponse.json({ error: 'No active workspace' }, { status: 401 })

    // Check invoker is ADMIN of that workspace
    const invokerMembership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
      include: { workspace: true }
    })
    if (!invokerMembership || invokerMembership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can modify invitations' }, { status: 403 })
    }

    const { action } = await req.json()
    const id = (await params).id

    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { id, workspaceId }
    })

    if (!invitation) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })

    if (action === 'resend') {
      if (invitation.status === 'ACCEPTED') return NextResponse.json({ error: 'Already accepted' }, { status: 400 })
      
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const updated = await prisma.workspaceInvitation.update({
        where: { id },
        data: {
          token,
          expiresAt,
          lastSentAt: new Date(),
          status: 'PENDING'
        }
      })

      const inviteLink = `${process.env.AUTH_URL}/login?invite=${token}`
      await sendWorkspaceInvite(
        updated.email,
        invokerMembership.workspace.name,
        session.user.name || session.user.email || 'An admin',
        updated.role,
        7,
        inviteLink
      )

      await logAction('WORKSPACE', workspaceId, 'Invitation Resent', { email: updated.email }, session.user.id)
      return NextResponse.json({ success: true, invitation: updated }, { status: 200 })
    } 
    
    if (action === 'revoke') {
      if (invitation.status === 'ACCEPTED') return NextResponse.json({ error: 'Cannot revoke accepted invitation' }, { status: 400 })
      
      const updated = await prisma.workspaceInvitation.update({
        where: { id },
        data: { status: 'REVOKED' }
      })

      await logAction('WORKSPACE', workspaceId, 'Invitation Revoked', { email: updated.email }, session.user.id)
      return NextResponse.json({ success: true, invitation: updated }, { status: 200 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Failed to modify invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
