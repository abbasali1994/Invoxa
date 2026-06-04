import React from "react";

export function LoginCard({ loading, handleSignIn }: { loading: boolean, handleSignIn: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808', padding: '3rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ background: '#111827', borderRadius: '20px', padding: '2.5rem', border: '1px solid #1f2937', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
          <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.3px' }}>Welcome back</h2>
          <p style={{ color: '#6b7280', marginBottom: '2.5rem', fontSize: '14px' }}>Sign in to access your Invoxa workspace</p>

          <button
            onClick={handleSignIn}
            disabled={loading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              padding: '13px 24px', background: loading ? '#f3f4f6' : 'white', color: '#111',
              borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '15px', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              opacity: loading ? 0.7 : 1
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: '#1f2937' }} />
            <span style={{ color: '#374151', fontSize: '12px' }}>Secure OAuth 2.0</span>
            <div style={{ flex: 1, height: '1px', background: '#1f2937' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '1.5rem' }}>
            {[
              { icon: '🔐', label: 'Secure' },
              { icon: '⚡', label: 'Instant' },
              { icon: '🌐', label: 'Multi-WS' },
            ].map(f => (
              <div key={f.label} style={{ background: '#0d1117', border: '1px solid #1f2937', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', marginBottom: '4px' }}>{f.icon}</div>
                <div style={{ color: '#6b7280', fontSize: '11px' }}>{f.label}</div>
              </div>
            ))}
          </div>

          <p style={{ color: '#374151', fontSize: '12px', textAlign: 'center', lineHeight: 1.5 }}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
