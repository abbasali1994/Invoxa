'use client'
import React from 'react'

interface Props { score: number; label: string }
const colors: Record<string, string> = {
  Excellent: '#34d399', Good: '#34d399', Fair: '#fbbf24',
  'At Risk': '#f87171', Critical: '#ef4444'
}
export function HealthScoreCard({ score, label }: Props) {
  const color = colors[label] || '#a78bfa'
  const circumference = 2 * Math.PI * 54
  const dash = (score / 100) * circumference
  return (
    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#737373', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1rem' }}>Business Health Score</p>
      <div style={{ position: 'relative', width: '130px', height: '130px' }}>
        <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="65" cy="65" r="54" fill="none" stroke="#1f1f1f" strokeWidth="10" />
          <circle cx="65" cy="65" r="54" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>{score}</span>
          <span style={{ fontSize: '0.65rem', color: '#737373' }}>/ 100</span>
        </div>
      </div>
      <span style={{ marginTop: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color, padding: '0.25rem 0.75rem', background: `${color}20`, borderRadius: '100px' }}>{label}</span>
    </div>
  )
}
