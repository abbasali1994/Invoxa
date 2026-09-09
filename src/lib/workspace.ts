import { auth } from '@/auth'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getSession() {
  return auth()
}

export async function getCurrentWorkspaceId(): Promise<string | null> {
  const session = await auth()
  
  // 1. Try from session user
  if (session?.user?.currentWorkspaceId) {
    return session.user.currentWorkspaceId
  }

  // 2. Try from active_workspace_id cookie
  try {
    const cookieVal = cookies().get('active_workspace_id')?.value
    if (cookieVal) return cookieVal
  } catch {}

  // 3. Fallback: Lookup user memberships in DB
  if (session?.user?.id) {
    const member = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      orderBy: { invitedAt: 'asc' },
      select: { workspaceId: true }
    })
    if (member) return member.workspaceId

    // Or first workspace in DB if any
    const firstWs = await prisma.workspace.findFirst({
      select: { id: true }
    })
    if (firstWs) return firstWs.id
  }

  // 4. Default to first workspace in DB
  const defaultWs = await prisma.workspace.findFirst({
    select: { id: true }
  })
  return defaultWs?.id || null
}

export async function getCurrentRole(): Promise<'ADMIN' | 'EDITOR' | null> {
  const session = await auth()
  if (!session?.user?.currentRole) return 'ADMIN'
  return session.user.currentRole as 'ADMIN' | 'EDITOR'
}

