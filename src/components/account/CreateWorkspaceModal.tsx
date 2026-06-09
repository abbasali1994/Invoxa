import React from "react";
import { Loader2 } from "lucide-react";

export function CreateWorkspaceModal({ showCreateModal, setShowCreateModal, newWorkspaceName, setNewWorkspaceName, handleCreateWorkspace, creating }: any) {
  if (!showCreateModal) return null;

  return (
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
            className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
