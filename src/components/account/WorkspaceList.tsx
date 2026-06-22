import React from "react";
import { Plus, Building2, Crown, Users } from "lucide-react";

export function WorkspaceList({ workspaces, loading, setShowCreateModal, openManage, readOnly = false }: any) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-neutral-200">Your Workspaces</h3>
        {!readOnly && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 rounded-md text-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Workspace
          </button>
        )}
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
            {workspaces.map((ws: any) => (
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
                  <button
                    onClick={() => openManage(ws)}
                    className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    {ws.memberCount}
                  </button>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => openManage(ws)}
                    className="text-xs px-3 py-1 border border-neutral-700 rounded hover:bg-neutral-800 transition-colors"
                  >
                    {readOnly ? 'View Members' : (ws.role === 'ADMIN' ? 'Manage' : 'View')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
