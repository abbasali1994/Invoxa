'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Plus, Users, Crown, Eye, Trash2, UserPlus, Building2, X, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function AccountPage() {
  const { data: session } = useSession()
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'EDITOR'>('EDITOR')
  const [inviting, setInviting] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  const fetchWorkspaces = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/workspace')
      const data = await res.json()
      if (Array.isArray(data)) setWorkspaces(data)
    } catch { toast.error('Failed to load workspaces') }
    finally { setLoading(false) }
  }

  const openManage = async (workspace: any) => {
    setSelectedWorkspace(workspace)
    try {
      const res = await fetch(`/api/workspace/${workspace.id}/members`)
      const data = await res.json()
      setMembers(Array.isArray(data) ? data : [])
    } catch { toast.error('Failed to load members') }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedWorkspace) return
    setInviting(true)
    try {
      const res = await fetch('/api/workspace/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: selectedWorkspace.id, email: inviteEmail, role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`${inviteEmail} invited as ${inviteRole}`)
      setInviteEmail('')
      openManage(selectedWorkspace)
    } catch (e: any) {
      toast.error(e.message || 'Failed to invite')
    } finally { setInviting(false) }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!selectedWorkspace || !confirm('Remove this member?')) return
    try {
      const res = await fetch(`/api/workspace/${selectedWorkspace.id}/member/${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Member removed')
      openManage(selectedWorkspace)
    } catch (e: any) { toast.error(e.message || 'Failed') }
  }

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWorkspaceName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Workspace created')
      setShowCreateModal(false)
      setNewWorkspaceName('')
      fetchWorkspaces()
    } catch (e: any) { toast.error(e.message || 'Failed') }
    finally { setCreating(false) }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account</h2>
        <p className="text-neutral-400">Manage your profile and workspaces</p>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h3 className="text-base font-semibold mb-4 text-neutral-200">Profile</h3>
        {session?.user && (
          <div className="flex items-center gap-5">
            {session.user.image ? (
              <img src={session.user.image} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/30" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold">
                {session.user.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <div>
              <p className="font-semibold text-lg">{session.user.name}</p>
              <p className="text-neutral-400 text-sm">{session.user.email}</p>
              <p className="text-xs text-neutral-600 mt-1">Profile managed by Google — read only</p>
            </div>
          </div>
        )}
      </div>

      {/* Workspaces */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-neutral-200">Your Workspaces</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 rounded-md text-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Workspace
          </button>
        </div>

        {loading ? (
          <div className="text-neutral-500 text-sm">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-neutral-500 uppercase border-b border-neutral-800">
                <th className="py-2 text-left font-medium">Workspace</th>
                <th className="py-2 text-left font-medium">Role</th>
                <th className="py-2 text-left font-medium">Members</th>
                <th className="py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {workspaces.map((ws) => (
                <tr key={ws.id}>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <span className="font-medium">{ws.name}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ws.role === 'ADMIN'
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'bg-amber-500/10 text-amber-400'
                      }`}>
                      {ws.role === 'ADMIN' && <Crown className="w-3 h-3 inline mr-1" />}
                      {ws.role}
                    </span>
                  </td>
                  <td className="py-3 text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {ws.memberCount}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => openManage(ws)}
                      className="text-xs px-3 py-1 border border-neutral-700 rounded hover:bg-neutral-800 transition-colors"
                    >
                      {ws.role === 'ADMIN' ? 'Manage' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Members Panel */}
      {selectedWorkspace && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-indigo-300">
              {selectedWorkspace.name} — Members
            </h3>
            <button onClick={() => setSelectedWorkspace(null)} className="text-neutral-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedWorkspace.role === 'ADMIN' && (
            <div className="flex gap-3 mb-5">
              <input
                type="email"
                placeholder="colleague@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm outline-none"
              >
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-md text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                {inviting ? 'Inviting...' : 'Invite'}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
                <div className="flex items-center gap-3">
                  {m.image ? (
                    <img src={m.image} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                      {m.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-neutral-500">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${m.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>{m.role}</span>
                  {selectedWorkspace.role === 'ADMIN' && m.userId !== session?.user?.id && (
                    <button onClick={() => handleRemoveMember(m.userId)} className="text-neutral-600 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowCreateModal(false)} />
          <div className="relative z-50 bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-semibold mb-4">Create New Workspace</h3>
            <input
              type="text"
              placeholder="Workspace name..."
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-neutral-700 rounded-md text-sm hover:bg-neutral-800 transition-colors">Cancel</button>
              <button
                onClick={handleCreateWorkspace}
                disabled={creating || !newWorkspaceName.trim()}
                className="px-4 py-2 bg-indigo-600 rounded-md text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
