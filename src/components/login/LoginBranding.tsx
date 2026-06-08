'use client'

export function LoginBranding() {
  return (
    <div style={{ textAlign: 'center', maxWidth: '280px' }}>
      <h1 style={{
        fontSize: '2.2rem',
        fontWeight: 500,
        color: 'white',
        margin: '0 0 0.2rem',
        letterSpacing: '-0.01em',
      }}>
        Invoxa
      </h1>
      <div style={{
        width: '42px',
        height: '2px',
        background: 'linear-gradient(90deg, #a78bfa, #34d399)',
        margin: '0 auto 0.9rem',
        borderRadius: '2px',
      }} />
      <p style={{
        color: '#c4b5fd',
        fontSize: '0.78rem',
        lineHeight: 1.65,
        margin: '0 0 1.1rem',
      }}>
        AI-Native Financial Operations<br />for Modern Agencies
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
        {[
          'Smart Invoice Generation',
          'Multi-Currency Settlements',
          'AI-Powered Receipt Parsing',
          'Real-Time Analytics',
        ].map((text) => (
          <div key={text} style={{
            background: 'rgba(255,255,255,0.09)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '100px',
            padding: '0.28rem 0.8rem',
            color: 'rgba(255,255,255,0.88)',
            fontSize: '0.7rem',
          }}>
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}
