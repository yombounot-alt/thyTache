import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { BellRingIcon } from "lucide-react"

import { notificationService } from "@/services/notificationService"
import { notificationsKey } from "@/hooks/useNotifications"
import { useAuthStore } from "@/store/authStore"

const SIMULATION_INTERVAL_MS = 45_000

/**
 * Moteur de simulation "temps réel" : pousse périodiquement une notification
 * mockée pour l'utilisateur connecté, met à jour le cache React Query et
 * affiche un toast. Remplacer par un vrai WebSocket/SSE quand le backend
 * Express sera branché ne changera pas la façon dont les composants
 * consomment `useNotifications`.
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const userId = useAuthStore((s) => s.user?.id)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated || !userId) return

    const interval = setInterval(async () => {
      const notification = await notificationService.pushRandom(userId)
      queryClient.invalidateQueries({ queryKey: notificationsKey(userId) })
      toast(notification.title, {
        description: notification.message,
        icon: <BellRingIcon className="size-4" />,
      })
    }, SIMULATION_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isAuthenticated, userId, queryClient])

  return <>{children}</>
}
