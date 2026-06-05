import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FALLBACK_RATE = 83.5

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const from = searchParams.get('from') || 'USD'
  const to = searchParams.get('to') || 'INR'

  if (from === to) {
    return NextResponse.json({ rate: 1 })
  }

  const endpoint = date
    ? `https://api.frankfurter.app/${date}?from=${from}&to=${to}`
    : `https://api.frankfurter.app/latest?from=${from}&to=${to}`

  try {
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error(`Frankfurt API returned ${res.status}`)
    const data = await res.json()
    const rate = data.rates?.[to]
    if (!rate) throw new Error('Rate not found in response')
    return NextResponse.json({ rate })
  } catch (err) {
    console.error('[exchange-rate] fetch failed:', err)
    return NextResponse.json({ rate: FALLBACK_RATE, fallback: true })
  }
}
