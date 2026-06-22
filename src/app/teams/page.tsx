'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAccount } from '@/hooks/useAccount'
import { WorkspaceList } from '@/components/account/WorkspaceList'
import { WorkspaceMembersPanel } from '@/components/account/WorkspaceMembersPanel'
import { CreateWorkspaceModal } from '@/components/account/CreateWorkspaceModal'
import { TeamSettingsTab } from '@/components/settings/TeamSettingsTab'

function TeamsContent() {
  const { data: session } = useSession()
  const accountProps = useAccount()
  const searchParams = useSearchParams()
  const router = useRouter()

  const tab = searchParams.get('tab') || 'workspaces'
  const activeTab = ['workspaces', 'invitations'].includes(tab) ? tab : 'workspaces'

  const handleTabChange = (newTab: string) => {
    router.push(`/teams?tab=${newTab}`)
  }

  const hasAdminWorkspace = accountProps.workspaces.some((ws: any) => ws.role === 'ADMIN')

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Teams & Workspaces</h2>
        <p className="text-neutral-400">Manage your workspaces, invite members, and configure team invitations.</p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col min-h-[500px]">
        {/* Tab Bar */}
        <div className="flex border-b border-neutral-800 px-4">
          <button
            onClick={() => handleTabChange('workspaces')}
            className={`py-4 px-5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'workspaces'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Workspaces
          </button>
          {(!accountProps.loading && hasAdminWorkspace) || (accountProps.loading && activeTab === 'invitations') ? (
            <button
              onClick={() => handleTabChange('invitations')}
              className={`py-4 px-5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'invitations'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Invitations
            </button>
          ) : null}
        </div>

        <div className="p-8 space-y-6">
          {activeTab === 'workspaces' && (
            <div className="space-y-6">
              <WorkspaceList {...accountProps} />
              <WorkspaceMembersPanel {...accountProps} session={session} />
              <CreateWorkspaceModal {...accountProps} />
            </div>
          )}
          {activeTab === 'invitations' && hasAdminWorkspace && <TeamSettingsTab />}
        </div>
      </div>
    </div>
  )
}

export default function TeamsPage() {
  return (
    <Suspense>
      <TeamsContent />
    </Suspense>
  )
}
