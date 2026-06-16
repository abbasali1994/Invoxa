import React from 'react'

interface Props { data: any }
export function ExpenseAnalysisCard({ data }: Props) {
  return (
    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '1.5rem' }}>
      <p style={{ color: '#737373', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.75rem' }}>Expense Analysis</p>
      <p style={{ color: 'white', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>{data?.headline}</p>
      <p style={{ color: '#a3a3a3', fontSize: '0.825rem', lineHeight: 1.6, margin: '0 0 0.75rem' }}>{data?.details}</p>
      <p style={{ color: '#737373', fontSize: '0.72rem', margin: '0 0 0.5rem', textTransform: 'uppercase' }}>Pain Points</p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {(data?.painPoints || []).map((p: string, i: number) => (
          <li key={i} style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{p}</li>
        ))}
      </ul>
    </div>
  )
}
