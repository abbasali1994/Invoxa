export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { workspaceId } = await req.json()

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    include: { workspace: true },
  })

  if (!membership) return NextResponse.json({ error: 'Not a member of this workspace' }, { status: 403 })

  // Set cookie to persist workspace across reloads
  const cookieStore = cookies()
  cookieStore.set('active_workspace_id', workspaceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return NextResponse.json({
    workspaceId: membership.workspaceId,
    workspaceName: membership.workspace.name,
    role: membership.role,
  })
}
