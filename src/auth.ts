import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { authConfig } from './auth.config'
import { cookies } from 'next/headers'
import { logAction } from '@/lib/audit'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  events: {
    async signIn({ user }) {
      if (!user?.email || !user?.id) return;

      try {
        const pendingInvites = await prisma.workspaceInvitation.findMany({
          where: { email: user.email, status: 'PENDING' }
        });

        for (const invite of pendingInvites) {
          if (invite.expiresAt < new Date()) {
            await prisma.workspaceInvitation.update({
              where: { id: invite.id },
              data: { status: 'EXPIRED' }
            });
            continue;
          }

          const existing = await prisma.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId: user.id } }
          });

          if (!existing) {
            await prisma.workspaceMember.create({
              data: {
                workspaceId: invite.workspaceId,
                userId: user.id,
                role: invite.role,
              }
            });
          }

          await prisma.workspaceInvitation.update({
            where: { id: invite.id },
            data: { status: 'ACCEPTED', acceptedAt: new Date() }
          });

          await logAction('WORKSPACE', invite.workspaceId, 'Invitation Accepted', { email: user.email, role: invite.role }, user.id);
        }
      } catch (error) {
        console.error('Error processing invitations on signIn:', error);
      }
    }
  },
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

        const email = session.user?.email || token?.email
        if (email) {
          try {
            const pendingInvites = await prisma.workspaceInvitation.findMany({
              where: { email, status: 'PENDING' }
            })

            for (const invite of pendingInvites) {
              if (invite.expiresAt < new Date()) {
                await prisma.workspaceInvitation.update({
                  where: { id: invite.id },
                  data: { status: 'EXPIRED' }
                })
                continue
              }

              const existing = await prisma.workspaceMember.findUnique({
                where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId } }
              })

              if (!existing) {
                await prisma.workspaceMember.create({
                  data: {
                    workspaceId: invite.workspaceId,
                    userId,
                    role: invite.role,
                  }
                })
              }

              await prisma.workspaceInvitation.update({
                where: { id: invite.id },
                data: { status: 'ACCEPTED', acceptedAt: new Date() }
              })

              await logAction('WORKSPACE', invite.workspaceId, 'Invitation Accepted', { email, role: invite.role }, userId)
              
              activeWorkspaceId = invite.workspaceId
              try {
                cookies().set('active_workspace_id', invite.workspaceId, {
                  httpOnly: true,
                  sameSite: 'lax',
                  secure: process.env.NODE_ENV === 'production',
                  path: '/',
                  maxAge: 60 * 60 * 24 * 365,
                })
              } catch (cookieErr) {
                console.error('Failed to set cookie in session callback:', cookieErr)
              }
            }
          } catch (inviteErr) {
            console.error('Error processing invitations in session callback:', inviteErr)
          }
        }

        let memberships = await prisma.workspaceMember.findMany({
          where: { userId },
          include: { workspace: true },
          orderBy: { invitedAt: 'asc' },
        })

        if (memberships.length === 0) {
          // Check if there is an existing seeded workspace (e.g. Invoxa Global Operations)
          const primaryWorkspace = await prisma.workspace.findFirst({
            orderBy: { createdAt: 'asc' }
          })

          if (primaryWorkspace) {
            await prisma.workspaceMember.create({
              data: {
                workspaceId: primaryWorkspace.id,
                userId,
                role: 'ADMIN',
              }
            })
            memberships = await prisma.workspaceMember.findMany({
              where: { userId },
              include: { workspace: true },
            })
          } else {
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
            memberships = await prisma.workspaceMember.findMany({
              where: { userId },
              include: { workspace: true },
            })
          }
        }

        session.user.workspaces = memberships.map((m) => ({
          id: m.workspaceId,
          name: m.workspace.name,
          role: m.role as 'ADMIN' | 'EDITOR',
        }))
        const selectedMembership = activeWorkspaceId
          ? memberships.find((m) => m.workspaceId === activeWorkspaceId)
          : null
        const resolvedMembership = selectedMembership ?? memberships[0]
        if (resolvedMembership) {
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
