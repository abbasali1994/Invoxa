'use client'
import { signIn } from 'next-auth/react'

export function LoginCard() {
  return (
    <div style={{
      width: '100%',
      maxWidth: '300px',
      background: 'rgba(10,8,20,0.7)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '2rem',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <h2 style={{
        color: 'white',
        fontSize: '1.35rem',
        fontWeight: 500,
        margin: '0 0 0.3rem',
      }}>
        Welcome back
      </h2>
      <p style={{ color: '#555', fontSize: '0.8rem', margin: '0 0 1.4rem' }}>
        Sign in to your workspace
      </p>
      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '10px 16px',
          background: 'white',
          color: '#111',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 500,
          marginBottom: '0.75rem',
        }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
      <p style={{ color: '#2a2a2a', fontSize: '0.68rem', textAlign: 'center', margin: 0 }}>
        By signing in, you agree to our Terms of Service
      </p>
    </div>
  )
}
