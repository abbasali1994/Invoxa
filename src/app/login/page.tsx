'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Left — Branding */}
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

      {/* Right — Login Card */}
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
    </div>
  )
}
