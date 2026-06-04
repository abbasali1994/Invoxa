import React from "react";

export function LoginBranding() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 60%, #0f0e2a 100%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '30%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: '420px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Invoxa</h1>
        </div>

        <p style={{ color: '#c7d2fe', fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          AI-Native Financial Operations Platform for Modern Agencies
        </p>

        <svg viewBox="0 0 400 300" style={{ width: '100%', maxWidth: '380px', opacity: 0.85 }}>
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

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '2rem' }}>
          {['Multi-Workspace', 'RBAC', 'Settlement AI'].map(tag => (
            <span key={tag} style={{ fontSize: '11px', color: '#a5b4fc', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', padding: '4px 10px', borderRadius: '99px' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
