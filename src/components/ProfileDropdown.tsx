'use client'

import { ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useProfileDropdown } from '@/hooks/useProfileDropdown'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { WorkspaceSwitcher } from '@/components/profile/WorkspaceSwitcher'

export function ProfileDropdown() {
  const profileState = useProfileDropdown()
  const { session, user, initials, router, handleSignOut } = profileState

  if (!session?.user || !user) return null

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
        <ProfileHeader {...profileState} />

        <DropdownMenuItem onClick={() => router.push('/account')} className="hover:bg-neutral-800 cursor-pointer text-sm text-neutral-300">
          <User className="w-4 h-4 mr-2" /> Account
        </DropdownMenuItem>

        <WorkspaceSwitcher {...profileState} />

        <div style={{ height: '1px', background: '#1f2937', margin: '4px 0' }} />
        <DropdownMenuItem onClick={handleSignOut} className="hover:bg-rose-500/10 cursor-pointer text-sm text-rose-400">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

