import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { notificationService } from "@/services/notificationService"
import { useAuthStore } from "@/store/authStore"

const POLL_INTERVAL_MS = 30_000

export const notificationsKey = (userId?: string) => ["notifications", userId] as const

export function useNotifications() {
  const userId = useAuthStore((s) => s.user?.id)
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: notificationsKey(userId),
    queryFn: () => notificationService.list(),
    enabled: Boolean(userId),
    // Pas de WebSocket/SSE côté backend : on rafraîchit périodiquement pour
    // détecter les notifications générées par des événements serveur (tâche
    // créée/terminée...). Voir NotificationProvider pour l'affichage en toast.
    refetchInterval: POLL_INTERVAL_MS,
  })

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKey(userId) }),
  })

  const markAllAsRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKey(userId) }),
  })

  const notifications = query.data ?? []
  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    markAsRead,
    markAllAsRead,
  }
}
