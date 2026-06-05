import React from "react";

export function LoginBranding() {
  return (
    <div
      className="hidden md:flex flex-col justify-center items-center p-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 60%, #0f0e2a 100%)' }}
    >
      <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(99,102,241,0.2)', filter: 'blur(80px)' }} />

      <div className="relative text-center max-w-md w-full">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span className="text-xl">⚡</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Invoxa</h1>
        </div>

        <p className="text-indigo-200 text-lg leading-relaxed mb-10">
          AI-Native Financial Operations Platform for Modern Agencies
        </p>

        <svg viewBox="0 0 400 300" className="w-full max-w-sm mx-auto opacity-85">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <circle cx="200" cy="150" r="80" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" />
          <circle cx="200" cy="150" r="120" fill="none" stroke="#4338ca" strokeWidth="0.8" strokeDasharray="8 4" opacity="0.7" />
          <circle cx="200" cy="150" r="55" fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="1" />
          <line x1="80" y1="150" x2="320" y2="150" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
          <line x1="200" y1="30" x2="200" y2="270" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
          <text x="182" y="158" fill="#a5b4fc" fontSize="22" fontWeight="700">₹$</text>
          <circle cx="130" cy="90" r="6" fill="#6366f1" opacity="0.9" />
          <circle cx="270" cy="90" r="6" fill="#818cf8" opacity="0.9" />
          <circle cx="130" cy="210" r="6" fill="#818cf8" opacity="0.9" />
          <circle cx="270" cy="210" r="6" fill="#6366f1" opacity="0.9" />
          <line x1="130" y1="90" x2="270" y2="210" stroke="#6366f1" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.5" />
          <line x1="270" y1="90" x2="130" y2="210" stroke="#818cf8" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.5" />
        </svg>

        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {['Multi-Workspace', 'RBAC', 'Settlement AI'].map(tag => (
            <span key={tag} className="text-xs text-indigo-300 px-3 py-1 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
