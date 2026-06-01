import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

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
      session.user.id = user.id

      // Check for active workspace cookie
      let activeWorkspaceId: string | null = null
      try {
        const cookieStore = cookies()
        activeWorkspaceId = cookieStore.get('active_workspace_id')?.value ?? null
      } catch {}

      // Fetch all workspaces for this user
      const memberships = await prisma.workspaceMember.findMany({
        where: { userId: user.id },
        include: { workspace: true },
        orderBy: { invitedAt: 'asc' },
      })

      // First-time login — auto-create a workspace
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

        // Respect cookie-selected workspace if it's a valid membership
        const activeMembership = activeWorkspaceId
          ? memberships.find((m) => m.workspaceId === activeWorkspaceId)
          : null

        const resolved = activeMembership ?? memberships[0]
        session.user.currentWorkspaceId = resolved.workspaceId
        session.user.currentRole = resolved.role as 'ADMIN' | 'EDITOR'
      }

      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
