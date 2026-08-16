import { db } from "@/mocks/db"
import { delay, generateId, MockApiError } from "@/services/mockClient"
import { api } from "@/lib/axios"
import { toApiError } from "@/lib/apiError"
import { mapBackendUser, type BackendUser } from "@/lib/mapBackendUser"
import type { PaginatedResponse, PaginationParams } from "@/types/api"
import type { User, UserRole } from "@/types/user"

export interface UserQueryParams extends PaginationParams {
  role?: UserRole
  status?: User["status"]
}

export const userService = {
  async list(params: UserQueryParams = {}): Promise<PaginatedResponse<User>> {
    await delay()
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 10
    let filtered = [...db.users]

    if (params.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    }
    if (params.role) filtered = filtered.filter((u) => u.role === params.role)
    if (params.status) filtered = filtered.filter((u) => u.status === params.status)

    const start = (page - 1) * pageSize
    const data = filtered.slice(start, start + pageSize)

    return {
      data,
      meta: {
        page,
        pageSize,
        total: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
      },
    }
  },

  // Seule méthode branchée sur le vrai backend (GET /users, annuaire minimal
  // en lecture seule). La gestion admin (créer/modifier/désactiver/rôles) ci-
  // dessous reste mockée : pas encore d'API dédiée côté serveur.
  async listAll(): Promise<User[]> {
    try {
      const { data } = await api.get("/users")
      return (data.data as BackendUser[]).map(mapBackendUser)
    } catch (error) {
      throw toApiError(error, "Échec du chargement des utilisateurs")
    }
  },

  async getById(id: string): Promise<User> {
    await delay(150)
    const user = db.users.find((u) => u.id === id)
    if (!user) throw new MockApiError("Utilisateur introuvable")
    return user
  },

  async create(input: {
    firstName: string
    lastName: string
    email: string
    role: UserRole
  }): Promise<User> {
    await delay()
    if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new MockApiError("Un utilisateur existe déjà avec cet email.", {
        email: "Email déjà utilisé",
      })
    }
    const user: User = {
      id: generateId("u"),
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      role: input.role,
      status: "active",
      createdAt: new Date().toISOString(),
      preferences: {
        darkMode: true,
        emailNotifications: true,
        pushNotifications: true,
        weeklyDigest: true,
      },
    }
    db.users.push(user)
    db.passwords[user.email] = "Password1"
    return user
  },

  async update(id: string, patch: Partial<User>): Promise<User> {
    await delay()
    const user = db.users.find((u) => u.id === id)
    if (!user) throw new MockApiError("Utilisateur introuvable")
    Object.assign(user, patch)
    return user
  },

  async remove(id: string): Promise<void> {
    await delay()
    const index = db.users.findIndex((u) => u.id === id)
    if (index !== -1) db.users.splice(index, 1)
  },

  async toggleStatus(id: string): Promise<User> {
    await delay(200)
    const user = db.users.find((u) => u.id === id)
    if (!user) throw new MockApiError("Utilisateur introuvable")
    user.status = user.status === "active" ? "inactive" : "active"
    return user
  },

  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    await delay(300)
    const user = db.users.find((u) => u.id === id)
    if (!user) throw new MockApiError("Utilisateur introuvable")
    const temporaryPassword = `Temp${Math.floor(1000 + Math.random() * 9000)}!`
    db.passwords[user.email] = temporaryPassword
    return { temporaryPassword }
  },

  async assignRole(id: string, role: UserRole): Promise<User> {
    await delay(200)
    const user = db.users.find((u) => u.id === id)
    if (!user) throw new MockApiError("Utilisateur introuvable")
    user.role = role
    return user
  },
}
