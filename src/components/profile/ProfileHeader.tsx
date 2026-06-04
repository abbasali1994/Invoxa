import React from "react";

export function ProfileHeader({ user, initials, currentWorkspace }: any) {
  return (
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
  );
}
