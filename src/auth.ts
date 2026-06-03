import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      try {
        session.user.id = user.id

        const memberships = await prisma.workspaceMember.findMany({
          where: { userId: user.id },
          include: { workspace: true },
          orderBy: { invitedAt: 'asc' },
        })

        if (memberships.length === 0) {
          const slug = `${user.email?.split('@')[0]}-${Date.now()}`
          const workspace = await prisma.workspace.create({
            data: {
              name: `${user.name ?? 'My'}'s Workspace`,
              slug,
              ownerId: user.id,
              members: {
                create: { userId: user.id, role: 'ADMIN' },
              },
            },
          })
          session.user.workspaces = [{ id: workspace.id, name: workspace.name, role: 'ADMIN' }]
          session.user.currentWorkspaceId = workspace.id
          session.user.currentRole = 'ADMIN'
        } else {
          session.user.workspaces = memberships.map((m) => ({
            id: m.workspaceId,
            name: m.workspace.name,
            role: m.role as 'ADMIN' | 'EDITOR',
          }))
          session.user.currentWorkspaceId = memberships[0].workspaceId
          session.user.currentRole = memberships[0].role as 'ADMIN' | 'EDITOR'
        }
      } catch (error) {
        console.error('Session callback error:', error)
      }

      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
