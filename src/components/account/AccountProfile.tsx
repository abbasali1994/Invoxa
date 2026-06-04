import React from "react";

export function AccountProfile({ session }: { session: any }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="text-base font-semibold mb-4 text-neutral-200">Profile</h3>
      {session?.user && (
        <div className="flex items-center gap-5">
          {session.user.image ? (
            <img src={session.user.image} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/30" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold">
              {session.user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <div>
            <p className="font-semibold text-lg">{session.user.name}</p>
            <p className="text-neutral-400 text-sm">{session.user.email}</p>
            <p className="text-xs text-neutral-600 mt-1">Profile managed by Google — read only</p>
          </div>
        </div>
      )}
    </div>
  );
}
