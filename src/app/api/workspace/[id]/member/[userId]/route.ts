export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/workspace/[id]/member/[userId] — remove a member (ADMIN only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: workspaceId, userId: targetUserId } = await params

  // Verify invoker is ADMIN
  const invokerMembership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!invokerMembership || invokerMembership.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 })
  }

  // Can't remove yourself if you're the owner
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (workspace?.ownerId === targetUserId) {
    return NextResponse.json({ error: 'Cannot remove the workspace owner' }, { status: 400 })
  }

  await prisma.workspaceMember.delete({
    where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
  })

  return NextResponse.json({ success: true })
}
