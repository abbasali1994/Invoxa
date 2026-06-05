'use client'
import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { LoginBranding } from '@/components/login/LoginBranding'
import { LoginCard } from '@/components/login/LoginCard'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  // Clear any stale auth cookies that might cause redirect loops
  useEffect(() => {
    // Clear next-auth session cookies
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim()
      if (name.includes('next-auth') || name.includes('authjs')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      }
    })
  }, [])

  const handleSignIn = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="grid md:grid-cols-2 min-h-screen font-sans">
      <LoginBranding />
      <LoginCard loading={loading} handleSignIn={handleSignIn} />
    </div>
  )
}

