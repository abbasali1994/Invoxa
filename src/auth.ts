import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { authConfig } from './auth.config'
import { cookies } from 'next/headers'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token, user }) {
      try {
        const userId = user?.id || token?.sub
        if (!userId) return session

        session.user.id = userId
        let activeWorkspaceId: string | null = null
        try {
          activeWorkspaceId = cookies().get('active_workspace_id')?.value ?? null
        } catch {}

        const memberships = await prisma.workspaceMember.findMany({
          where: { userId },
          include: { workspace: true },
          orderBy: { invitedAt: 'asc' },
        })
        if (memberships.length === 0) {
          const email = session.user?.email || token?.email || 'user@example.com'
          const name = session.user?.name || token?.name || 'My'
          const slug = `${email.split('@')[0]}-${Date.now()}`
          const workspace = await prisma.workspace.create({
            data: {
              name: `${name}'s Workspace`,
              slug,
              ownerId: userId,
              members: { create: { userId: userId, role: 'ADMIN' } },
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
          const selectedMembership = activeWorkspaceId
            ? memberships.find((m) => m.workspaceId === activeWorkspaceId)
            : null
          const resolvedMembership = selectedMembership ?? memberships[0]
          session.user.currentWorkspaceId = resolvedMembership.workspaceId
          session.user.currentRole = resolvedMembership.role as 'ADMIN' | 'EDITOR'
        }
      } catch (error) {
        console.error('Session callback error:', error)
      }
      return session
    },
  },
})
