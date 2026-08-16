import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { notificationService } from "@/services/notificationService"
import { useAuthStore } from "@/store/authStore"

export const notificationsKey = (userId?: string) => ["notifications", userId] as const

export function useNotifications() {
  const userId = useAuthStore((s) => s.user?.id)
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: notificationsKey(userId),
    queryFn: () => notificationService.list(userId as string),
    enabled: Boolean(userId),
  })

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKey(userId) }),
  })

  const markAllAsRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(userId as string),
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
