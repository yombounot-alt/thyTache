import { api } from "@/lib/axios"
import { toApiError } from "@/lib/apiError"
import type { AppNotification } from "@/types/notification"

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    try {
      const { data } = await api.get("/notifications")
      return data.data
    } catch (error) {
      throw toApiError(error, "Échec du chargement des notifications")
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await api.patch(`/notifications/${id}/read`)
    } catch (error) {
      throw toApiError(error, "Échec de la mise à jour de la notification")
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await api.patch("/notifications/read-all")
    } catch (error) {
      throw toApiError(error, "Échec de la mise à jour des notifications")
    }
  },
}
