import { auth } from '@/auth'

export async function getCurrentWorkspaceId(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.currentWorkspaceId) return null
  return session.user.currentWorkspaceId
}

export async function getCurrentRole(): Promise<'ADMIN' | 'EDITOR' | null> {
  const session = await auth()
  if (!session?.user?.currentRole) return null
  return session.user.currentRole as 'ADMIN' | 'EDITOR'
}
