import { api } from "@/lib/axios"
import { toApiError } from "@/lib/apiError"
import { mapBackendUser, type BackendUser } from "@/lib/mapBackendUser"
import type { PaginatedResponse } from "@/types/api"
import type { User, UserRole } from "@/types/user"

export interface UserQueryParams {
  page?: number
  pageSize?: number
  search?: string
  role?: UserRole
  status?: User["status"]
}

async function request<T>(operation: () => Promise<T>, fallback: string): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    throw toApiError(error, fallback)
  }
}

function mapUser(raw: BackendUser) {
  return mapBackendUser(raw)
}

export const userService = {
  async list(params: UserQueryParams = {}): Promise<PaginatedResponse<User>> {
    return request(async () => {
      const { data } = await api.get("/users", { params })
      return { data: data.data.data.map(mapUser), meta: data.data.meta }
    }, "Échec du chargement des utilisateurs")
  },

  async listAll(): Promise<User[]> {
    const result = await userService.list({ page: 1, pageSize: 100 })
    return result.data
  },

  async getById(id: string): Promise<User> {
    return request(async () => {
      const { data } = await api.get(`/users/${id}`)
      return mapUser(data.data)
    }, "Utilisateur introuvable")
  },

  async create(input: { firstName: string; lastName: string; email: string; role: UserRole }): Promise<User> {
    return request(async () => {
      const { data } = await api.post("/users", input)
      return mapUser(data.data)
    }, "Échec de la création de l'utilisateur")
  },

  async update(id: string, patch: Partial<User>): Promise<User> {
    return request(async () => {
      const { data } = await api.patch(`/users/${id}`, patch)
      return mapUser(data.data)
    }, "Échec de la mise à jour de l'utilisateur")
  },

  async remove(id: string): Promise<void> {
    return request(async () => {
      await api.delete(`/users/${id}`)
    }, "Échec de la suppression de l'utilisateur")
  },

  async toggleStatus(id: string): Promise<User> {
    return request(async () => {
      const user = await userService.getById(id)
      const { data } = await api.patch(`/users/${id}/status`, { isActive: user.status !== "active" })
      return mapUser(data.data)
    }, "Échec de la modification du statut")
  },

  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    return request(async () => {
      const { data } = await api.post(`/users/${id}/reset-password`)
      return data.data
    }, "Échec de la réinitialisation du mot de passe")
  },

  async assignRole(id: string, role: UserRole): Promise<User> {
    return request(async () => {
      const { data } = await api.patch(`/users/${id}/role`, { role })
      return mapUser(data.data)
    }, "Échec de la modification du rôle")
  },

  async uploadAvatar(file: File): Promise<User> {
    return request(async () => {
      const formData = new FormData()
      formData.append("avatar", file)
      const { data } = await api.post("/users/me/avatar", formData)
      return mapUser(data.data)
    }, "Échec de l'envoi de la photo de profil")
  },
}
