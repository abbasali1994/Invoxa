import React from "react";
import { X, UserPlus, Trash2 } from "lucide-react";

export function WorkspaceMembersPanel({ 
  selectedWorkspace, setSelectedWorkspace, members, inviteEmail, setInviteEmail, 
  inviteRole, setInviteRole, handleInvite, inviting, handleRemoveMember, session 
}: any) {
  if (!selectedWorkspace) return null;

  return (
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
        {members.map((m: any) => (
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
  );
}
