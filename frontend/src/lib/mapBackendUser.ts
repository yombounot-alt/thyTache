import type { User } from "@/types/user"

export interface BackendUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "user" | "admin" | "manager" | "member"
  isEmailVerified: boolean
  isActive?: boolean
  phone?: string | null
  avatarUrl?: string | null
  preferences?: User["preferences"]
  createdAt?: string
  lastActiveAt?: string | null
}

// "user" est l'ancienne valeur de rôle par défaut (documents créés avant
// l'introduction de member/manager/admin côté backend) : on la traduit ici
// vers "member" pour rester compatible avec le type `User` du frontend.
export function mapBackendUser(raw: BackendUser): User {
  return {
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    role: raw.role === "user" ? "member" : raw.role,
    status: raw.isActive === false ? "inactive" : "active",
    createdAt: raw.createdAt ?? new Date().toISOString(),
    lastActiveAt: raw.lastActiveAt ?? undefined,
    phone: raw.phone ?? undefined,
    avatarUrl: raw.avatarUrl ?? undefined,
    preferences: raw.preferences ?? { darkMode: false, emailNotifications: true, pushNotifications: true, weeklyDigest: true },
  }
}
