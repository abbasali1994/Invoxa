export type WorkspaceRole = 'ADMIN' | 'EDITOR'

export const permissions = {
  // Actions that EDITOR cannot perform — require ADMIN
  requiresAdmin: [
    'settlement.create',
    'settlement.delete',
    'invoice.delete',
    'expense.delete',
    'account.create',
    'account.update',
    'ledger.create',
    'member.invite',
    'member.remove',
  ],

  // Everything an EDITOR can do freely
  editorAllowed: [
    'invoice.create',
    'invoice.view',
    'invoice.edit',
    'client.create',
    'client.view',
    'client.edit',
    'expense.create',
    'expense.view',
    'expense.edit',

    'report.view',
    'account.view',
    'ledger.view',
    'settlement.view',
  ],
}

export function canPerform(role: WorkspaceRole, action: string): boolean {
  if (role === 'ADMIN') return true
  return permissions.editorAllowed.includes(action)
}

export function requiresAdmin(role: WorkspaceRole, action: string): boolean {
  if (role === 'ADMIN') return false
  return permissions.requiresAdmin.includes(action)
}
