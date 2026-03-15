export type UserPermissions = {
  dashboard: boolean
  records: boolean
  appointments: boolean
  sync: boolean
  settings: boolean
}

export type User = {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'pending'
  permissions: UserPermissions
}
