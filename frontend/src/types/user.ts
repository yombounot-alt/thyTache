export type UserRole = "admin" | "manager" | "member"
export type UserStatus = "active" | "inactive"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatarUrl?: string
  role: UserRole
  status: UserStatus
  createdAt: string
  lastActiveAt?: string
  preferences: UserPreferences
}

export interface UserPreferences {
  darkMode: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  weeklyDigest: boolean
}

export interface AuthSession {
  user: User
  token: string
}

export interface RoleDefinition {
  id: UserRole
  label: string
  description: string
  permissions: string[]
  color: string
}
