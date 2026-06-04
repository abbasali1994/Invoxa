'use client'

import { useSession } from 'next-auth/react'
import { useAccount } from '@/hooks/useAccount'
import { AccountProfile } from '@/components/account/AccountProfile'
import { WorkspaceList } from '@/components/account/WorkspaceList'
import { WorkspaceMembersPanel } from '@/components/account/WorkspaceMembersPanel'
import { CreateWorkspaceModal } from '@/components/account/CreateWorkspaceModal'

export default function AccountPage() {
  const { data: session } = useSession()
  const accountProps = useAccount()

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account</h2>
        <p className="text-neutral-400">Manage your profile and workspaces</p>
      </div>

      <AccountProfile session={session} />
      <WorkspaceList {...accountProps} />
      <WorkspaceMembersPanel {...accountProps} session={session} />
      <CreateWorkspaceModal {...accountProps} />
    </div>
  )
}
