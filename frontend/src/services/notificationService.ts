import { db } from "@/mocks/db"
import { delay, generateId } from "@/services/mockClient"
import type { AppNotification, NotificationType } from "@/types/notification"

function byUser(userId: string) {
  return db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

const RANDOM_POOL: Array<{ type: NotificationType; title: string; message: string }> = [
  {
    type: "task_created",
    title: "Nouvelle tâche créée",
    message: "Une nouvelle tâche vient d'être ajoutée au tableau de l'équipe.",
  },
  {
    type: "task_updated",
    title: "Tâche mise à jour",
    message: "Le statut d'une tâche assignée a changé.",
  },
  {
    type: "task_assigned",
    title: "Tâche assignée",
    message: "Une tâche vient de vous être assignée.",
  },
  {
    type: "task_comment",
    title: "Nouveau commentaire",
    message: "Un collègue a commenté une tâche que vous suivez.",
  },
]

export const notificationService = {
  async list(userId: string): Promise<AppNotification[]> {
    await delay(200)
    return byUser(userId)
  },

  async create(
    userId: string,
    payload: Pick<AppNotification, "type" | "title" | "message" | "link">
  ): Promise<AppNotification> {
    await delay(100)
    const notification: AppNotification = {
      id: generateId("notif"),
      userId,
      read: false,
      createdAt: new Date().toISOString(),
      ...payload,
    }
    db.notifications.unshift(notification)
    return notification
  },

  async pushRandom(userId: string): Promise<AppNotification> {
    const pick = RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)]
    return notificationService.create(userId, pick)
  },

  async markAsRead(id: string): Promise<void> {
    await delay(80)
    const notif = db.notifications.find((n) => n.id === id)
    if (notif) notif.read = true
  },

  async markAllAsRead(userId: string): Promise<void> {
    await delay(150)
    db.notifications.filter((n) => n.userId === userId).forEach((n) => (n.read = true))
  },
}
