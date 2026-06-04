import React from "react";
import { Building2, Check } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function WorkspaceSwitcher({ user, switching, switchWorkspace }: any) {
  if (!user.workspaces || user.workspaces.length <= 1) return null;

  return (
    <>
      <div style={{ height: '1px', background: '#1f2937', margin: '4px 0' }} />
      <div style={{ padding: '6px 12px 2px' }}>
        <p style={{ color: '#4b5563', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Switch Workspace</p>
      </div>
      {user.workspaces.map((ws: any) => (
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
  );
}
