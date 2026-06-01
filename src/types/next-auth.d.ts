import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image: string
      currentWorkspaceId: string
      currentRole: 'ADMIN' | 'EDITOR'
      workspaces: {
        id: string
        name: string
        role: 'ADMIN' | 'EDITOR'
      }[]
    }
  }
}
