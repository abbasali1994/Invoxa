import React from 'react'

interface Props { data: any }
export function FXLossCard({ data }: Props) {
  return (
    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '1.5rem' }}>
      <p style={{ color: '#737373', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.75rem' }}>FX Loss Analysis</p>
      <p style={{ color: 'white', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>{data?.headline}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ background: '#1a0a0a', borderRadius: '8px', padding: '0.6rem' }}>
          <p style={{ color: '#f87171', fontSize: '1rem', fontWeight: 700, margin: 0 }}>₹{data?.totalFXLoss?.toLocaleString('en-IN')}</p>
          <p style={{ color: '#737373', fontSize: '0.68rem', margin: 0 }}>Total FX Loss</p>
        </div>
        <div style={{ background: '#0d0d0d', borderRadius: '8px', padding: '0.6rem' }}>
          <p style={{ color: '#fbbf24', fontSize: '1rem', fontWeight: 700, margin: 0 }}>₹{data?.lossPerDollar?.toFixed(2)}</p>
          <p style={{ color: '#737373', fontSize: '0.68rem', margin: 0 }}>Loss per $1</p>
        </div>
      </div>
      <p style={{ color: '#737373', fontSize: '0.72rem', margin: '0 0 0.25rem' }}>Best Method: <span style={{ color: '#34d399' }}>{data?.bestPaymentMethod}</span></p>
      <p style={{ color: '#a3a3a3', fontSize: '0.8rem', lineHeight: 1.6, margin: '0.5rem 0 0', fontStyle: 'italic' }}>{data?.recommendation}</p>
    </div>
  )
}
