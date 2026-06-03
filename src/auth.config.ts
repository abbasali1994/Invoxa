import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    newUser: '/login?signup=success',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isLoginPage = nextUrl.pathname === '/login'
      const isSignupSuccess = isLoginPage && nextUrl.searchParams.get('signup') === 'success'
      const isApiAuth = nextUrl.pathname.startsWith('/api/auth')
      const isPublic = nextUrl.pathname.startsWith('/_next') || nextUrl.pathname === '/favicon.ico'

      if (isApiAuth || isPublic) return true
      if (isLoginPage) {
        if (isLoggedIn && !isSignupSuccess) return Response.redirect(new URL('/', nextUrl))
        return true
      }
      if (!isLoggedIn) return false
      return true
    },
  },
  session: { strategy: 'jwt' },  // middleware uses JWT, main auth uses database
}
