import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useAccount() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'EDITOR'>('EDITOR');
  const [inviting, setInviting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workspace');
      const data = await res.json();
      if (Array.isArray(data)) setWorkspaces(data);
    } catch { 
      toast.error('Failed to load workspaces');
    } finally { 
      setLoading(false);
    }
  };

  const openManage = async (workspace: any) => {
    setSelectedWorkspace(workspace);
    try {
      const res = await fetch(`/api/workspace/${workspace.id}/members`);
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch { 
      toast.error('Failed to load members');
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedWorkspace) return;
    setInviting(true);
    try {
      const res = await fetch('/api/workspace/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: selectedWorkspace.id, email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${inviteEmail} invited as ${inviteRole}`);
      setInviteEmail('');
      openManage(selectedWorkspace);
    } catch (e: any) {
      toast.error(e.message || 'Failed to invite');
    } finally { 
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedWorkspace || !confirm('Remove this member?')) return;
    try {
      const res = await fetch(`/api/workspace/${selectedWorkspace.id}/member/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Member removed');
      openManage(selectedWorkspace);
    } catch (e: any) { 
      toast.error(e.message || 'Failed');
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWorkspaceName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Workspace created');
      setShowCreateModal(false);
      setNewWorkspaceName('');
      fetchWorkspaces();
    } catch (e: any) { 
      toast.error(e.message || 'Failed');
    } finally { 
      setCreating(false);
    }
  };

  return {
    workspaces, loading, selectedWorkspace, setSelectedWorkspace,
    members, inviteEmail, setInviteEmail, inviteRole, setInviteRole,
    inviting, showCreateModal, setShowCreateModal, newWorkspaceName, setNewWorkspaceName,
    creating, openManage, handleInvite, handleRemoveMember, handleCreateWorkspace
  };
}
