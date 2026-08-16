import type { User } from "@/types/user"

export interface BackendUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "user" | "admin"
  isEmailVerified: boolean
}

// Le backend ne connaît que les rôles "user"/"admin" et ne renvoie ni statut
// actif, ni préférences (pas encore développés) : on adapte vers le type
// `User` existant (utilisé par tout le reste de l'UI, y compris les pages
// admin/tâches encore mockées) sans le modifier.
export function mapBackendUser(raw: BackendUser): User {
  return {
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    role: raw.role === "admin" ? "admin" : "member",
    status: "active",
    createdAt: new Date().toISOString(),
    preferences: {
      darkMode: false,
      emailNotifications: true,
      pushNotifications: true,
      weeklyDigest: true,
    },
  }
}
