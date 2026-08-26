import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { BellRingIcon } from "lucide-react"

import { useNotifications } from "@/hooks/useNotifications"
import { useAuthStore } from "@/store/authStore"

/**
 * Affiche un toast pour toute notification apparue depuis le dernier rendu.
 * S'appuie sur le polling de `useNotifications` (backend sans WebSocket/SSE) :
 * pas de génération côté client, les notifications viennent d'événements
 * métier réels (tâche créée/terminée...) déclenchés par le backend.
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const userId = useAuthStore((s) => s.user?.id)
  const { notifications } = useNotifications()
  const seenIds = useRef<Set<string> | null>(null)

  useEffect(() => {
    seenIds.current = null
  }, [userId])

  useEffect(() => {
    if (notifications.length === 0 && seenIds.current === null) {
      seenIds.current = new Set()
      return
    }

    if (seenIds.current === null) {
      seenIds.current = new Set(notifications.map((n) => n.id))
      return
    }

    for (const notification of notifications) {
      if (seenIds.current.has(notification.id)) continue
      seenIds.current.add(notification.id)
      toast(notification.title, {
        description: notification.message,
        icon: <BellRingIcon className="size-4" />,
      })
    }
  }, [notifications])

  return <>{children}</>
}
