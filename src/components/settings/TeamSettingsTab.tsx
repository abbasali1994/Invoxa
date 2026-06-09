'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Mail, RefreshCw, XCircle, Loader2 } from 'lucide-react'

type Invitation = {
  id: string
  email: string
  role: string
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
  invitedBy: { name: string | null; email: string }
  expiresAt: string
  lastSentAt: string | null
  createdAt: string
  acceptedAt: string | null
}

export function TeamSettingsTab() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('EDITOR')
  const [isInviting, setIsInviting] = useState(false)

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/workspace/invitations')
      const data = await res.json()
      if (data.success) {
        setInvitations(data.invitations)
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvitations()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setIsInviting(true)
    try {
      const workspaceId = document.cookie
        .split('; ')
        .find(row => row.startsWith('active_workspace_id='))
        ?.split('=')[1]

      if (!workspaceId) {
        toast.error('Workspace ID not found')
        return
      }

      const res = await fetch('/api/workspace/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, workspaceId })
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Invitation sent successfully')
        setEmail('')
        fetchInvitations()
      } else {
        toast.error(data.error || 'Failed to send invite')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsInviting(false)
    }
  }

  const handleAction = async (id: string, action: 'resend' | 'revoke') => {
    try {
      const res = await fetch(`/api/workspace/invitations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success(`Invitation ${action === 'resend' ? 'resent' : 'revoked'}`)
        fetchInvitations()
      } else {
        toast.error(data.error || 'Failed to perform action')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">Pending</span>
      case 'ACCEPTED':
        return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-500 text-xs rounded-full">Accepted</span>
      case 'EXPIRED':
        return <span className="px-2 py-1 bg-neutral-500/20 text-neutral-400 text-xs rounded-full">Expired</span>
      case 'REVOKED':
        return <span className="px-2 py-1 bg-rose-500/20 text-rose-500 text-xs rounded-full">Revoked</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Invite Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Invite Member</h3>
        <form onSubmit={handleInvite} className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="EDITOR">Editor</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            type="submit"
            disabled={isInviting || !email}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {isInviting ? "Sending..." : "Send Invite"}
          </button>
        </form>
      </div>

      {/* Invitations Table */}
      <div>
        <h3 className="text-lg font-medium mb-4">Invitations</h3>
        {loading ? (
          <p className="text-neutral-500 text-sm">Loading invitations...</p>
        ) : invitations.length === 0 ? (
          <div className="text-center py-12 border border-neutral-800 rounded-xl bg-neutral-900/50">
            <Mail className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400">No invitations sent yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-neutral-800 rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Invited By</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{inv.email}</div>
                      <div className="text-xs text-neutral-500">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-neutral-300">{inv.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-300">{inv.invitedBy?.name || 'Unknown'}</div>
                      <div className="text-xs text-neutral-500">{inv.invitedBy?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(inv.id, 'resend')}
                            className="p-2 text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 rounded transition-colors"
                            title="Resend Invite"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(inv.id, 'revoke')}
                            className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                            title="Revoke Invite"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
