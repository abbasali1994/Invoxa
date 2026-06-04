import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useProfileDropdown() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  const user = session?.user;
  const currentWorkspace = user?.workspaces?.find((w: any) => w.id === user.currentWorkspaceId);

  const switchWorkspace = async (workspaceId: string) => {
    setSwitching(true);
    const res = await fetch('/api/workspace/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    });
    
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('activeWorkspaceId', data.workspaceId);
      localStorage.setItem('activeWorkspaceName', data.workspaceName);
      localStorage.setItem('activeWorkspaceRole', data.role);
      window.location.href = '/';
    } else {
      setSwitching(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return {
    session,
    user,
    currentWorkspace,
    switching,
    switchWorkspace,
    initials,
    router,
    handleSignOut
  };
}
