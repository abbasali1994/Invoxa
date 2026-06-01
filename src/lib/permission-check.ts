import { auth } from '@/auth'
import { canPerform, requiresAdmin } from './permissions'
import { NextResponse } from 'next/server'

export async function checkPermission(action: string) {
  const session = await auth()
  if (!session) {
    return { allowed: false, requiresApproval: false, error: 'Unauthorized' }
  }

  const role = session.user.currentRole

  if (canPerform(role, action)) {
    return { allowed: true, requiresApproval: false }
  }

  if (requiresAdmin(role, action)) {
    return { allowed: false, requiresApproval: true, error: 'Admin approval required' }
  }

  return { allowed: false, requiresApproval: false, error: 'Insufficient permissions' }
}

/** Convenience wrapper that returns a NextResponse on failure */
export async function enforcePermission(action: string): Promise<NextResponse | null> {
  const check = await checkPermission(action)
  if (check.allowed) return null
  return NextResponse.json(
    { error: check.error, requiresApproval: check.requiresApproval ?? false },
    { status: check.requiresApproval ? 403 : 401 }
  )
}
