import { auth } from '@/auth'
import { cookies } from 'next/headers'

/**
 * Returns the active workspaceId for the current user.
 * Priority: cookie → first workspace in session.
 */
export async function getCurrentWorkspaceId(): Promise<string | null> {
  const session = await auth()
  if (!session?.user) return null

  // Try active workspace cookie first
  try {
    const cookieStore = cookies()
    const cookieWorkspaceId = cookieStore.get('active_workspace_id')?.value
    if (cookieWorkspaceId) {
      // Verify this workspace belongs to the user
      const valid = session.user.workspaces.find((w) => w.id === cookieWorkspaceId)
      if (valid) return cookieWorkspaceId
    }
  } catch {}

  return session.user.currentWorkspaceId ?? null
}

/**
 * Returns the full session, or null if unauthenticated.
 */
export async function getSession() {
  return auth()
}
