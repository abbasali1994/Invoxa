import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logAction } from '@/lib/audit'
import { cookies } from 'next/headers'

interface PageProps {
  params: {
    token: string
  }
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = params

  // 1. Retrieve the invitation
  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token },
    include: { workspace: true }
  })

  if (!invitation || invitation.status !== 'PENDING') {
    return (
      <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl backdrop-blur-md">
          <h1 className="text-xl font-bold text-rose-500 mb-2">Invalid or Expired Invitation</h1>
          <p className="text-neutral-400 text-sm mb-6">This invitation link is invalid or has already been used.</p>
          <Link href="/login" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // 2. Check if the invitation has expired
  if (invitation.expiresAt < new Date()) {
    await prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: 'EXPIRED' }
    })
    return (
      <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl backdrop-blur-md">
          <h1 className="text-xl font-bold text-rose-500 mb-2">Invitation Expired</h1>
          <p className="text-neutral-400 text-sm mb-6">This invitation has expired. Please ask the administrator to send a new one.</p>
          <Link href="/login" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // 3. Retrieve authentication session
  const session = await auth()
  if (!session?.user?.email) {
    // Not logged in. Redirect to login, specifying the redirect callback url
    redirect(`/login?callbackUrl=/invite/${token}`)
  }

  const userEmail = session.user.email
  const userId = session.user.id

  // 4. Verify email matches invitation email
  if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl backdrop-blur-md">
          <h1 className="text-xl font-bold text-amber-500 mb-3">Email Mismatch</h1>
          <p className="text-neutral-400 text-sm mb-4">
            This invitation was sent to <strong className="text-white font-semibold">{invitation.email}</strong>, but you are signed in as <strong className="text-white font-semibold">{userEmail}</strong>.
          </p>
          <p className="text-neutral-500 text-xs mb-6">
            Please sign out and sign in with the correct email account to accept this invitation.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Log in with different account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 5. Create WorkspaceMember
  const existingMember = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: invitation.workspaceId, userId } }
  })

  if (!existingMember) {
    await prisma.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId,
        role: invitation.role
      }
    })
  }

  // 6. Mark invitation as accepted
  await prisma.workspaceInvitation.update({
    where: { id: invitation.id },
    data: { status: 'ACCEPTED', acceptedAt: new Date() }
  })

  // 7. Audit log action
  await logAction('WORKSPACE', invitation.workspaceId, 'Invitation Accepted', { email: invitation.email, role: invitation.role }, userId)

  // 8. Set active workspace cookie
  cookies().set('active_workspace_id', invitation.workspaceId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  // 9. Redirect to the dashboard
  redirect('/')
}
