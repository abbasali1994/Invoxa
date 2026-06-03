import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { workspaceId } = await req.json()

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: session.user.id,
      },
    },
    include: { workspace: true },
  })

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this workspace' }, { status: 403 })
  }

  // Return the new workspace info — client stores in localStorage
  const response = NextResponse.json({
    workspaceId: membership.workspaceId,
    workspaceName: membership.workspace.name,
    role: membership.role,
  })
  response.cookies.set('active_workspace_id', membership.workspaceId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  return response
}
