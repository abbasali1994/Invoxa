'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, User, Settings, Building2, Check, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

export function ProfileDropdown() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [switching, setSwitching] = useState(false)

  if (!session?.user) return null

  const { user } = session
  const currentWorkspace = user.workspaces?.find((w) => w.id === user.currentWorkspaceId)

  const switchWorkspace = async (workspaceId: string) => {
    if (workspaceId === user.currentWorkspaceId) return
    setSwitching(true)
    try {
      const res = await fetch('/api/workspace/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId }),
      })
      if (!res.ok) throw new Error('Failed')
      await update() // re-fetch session
      toast.success('Workspace switched')
      router.refresh()
    } catch {
      toast.error('Failed to switch workspace')
    } finally {
      setSwitching(false)
    }
  }

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px 4px 4px',
          borderRadius: '10px', background: '#111', border: '1px solid #222', cursor: 'pointer',
          outline: 'none', transition: 'border-color 0.2s', color: 'inherit',
        }}
      >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? ''}
              style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'white', flexShrink: 0 }}>
              {initials}
            </div>
          )}
          <span style={{ color: 'white', fontSize: '13px', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name ?? user.email}
          </span>
          <ChevronDown style={{ color: '#555', width: '12px', height: '12px', flexShrink: 0 }} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 bg-neutral-900 border-neutral-800 shadow-2xl">
        {/* Profile header */}
        <div style={{ padding: '12px', borderBottom: '1px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            {user.image ? (
              <img src={user.image} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: 'white' }}>
                {initials}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'white', fontSize: '13px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
              <p style={{ color: '#555', fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
            </div>
          </div>

          {currentWorkspace && (
            <div style={{ background: '#0d1117', borderRadius: '6px', padding: '8px 10px' }}>
              <p style={{ color: '#555', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>Current Workspace</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ color: 'white', fontSize: '12px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{currentWorkspace.name}</p>
                <span style={{
                  fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, marginLeft: '6px', flexShrink: 0,
                  background: currentWorkspace.role === 'ADMIN' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)',
                  color: currentWorkspace.role === 'ADMIN' ? '#818cf8' : '#fbbf24',
                }}>
                  {currentWorkspace.role}
                </span>
              </div>
            </div>
          )}
        </div>

        <DropdownMenuItem onClick={() => router.push('/account')} className="hover:bg-neutral-800 cursor-pointer text-sm text-neutral-300">
          <User className="w-4 h-4 mr-2" /> Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')} className="hover:bg-neutral-800 cursor-pointer text-sm text-neutral-300">
          <Settings className="w-4 h-4 mr-2" /> Settings
        </DropdownMenuItem>

        {/* Workspace switcher */}
        {user.workspaces && user.workspaces.length > 1 && (
          <>
            <div style={{ height: '1px', background: '#1f2937', margin: '4px 0' }} />
            <div style={{ padding: '6px 12px 2px' }}>
              <p style={{ color: '#4b5563', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Switch Workspace</p>
            </div>
            {user.workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => switchWorkspace(ws.id)}
                className="hover:bg-neutral-800 cursor-pointer text-sm"
                style={{ paddingLeft: '20px', opacity: switching ? 0.5 : 1 }}
              >
                <Building2 style={{ width: '12px', height: '12px', marginRight: '8px', color: '#555' }} />
                <span style={{ flex: 1, color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
                <span style={{ fontSize: '10px', color: '#4b5563', marginLeft: '8px', flexShrink: 0 }}>{ws.role}</span>
                {ws.id === user.currentWorkspaceId && <Check style={{ width: '12px', height: '12px', marginLeft: '4px', color: '#818cf8', flexShrink: 0 }} />}
              </DropdownMenuItem>
            ))}
          </>
        )}

        <div style={{ height: '1px', background: '#1f2937', margin: '4px 0' }} />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="hover:bg-rose-500/10 cursor-pointer text-sm text-rose-400"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
