import type { AppNotification } from "@/types/notification"

const now = Date.now()
const HOUR = 3600_000
const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString()

export const seedNotifications: AppNotification[] = [
  {
    id: "n-1",
    userId: "u-admin",
    type: "task_assigned",
    title: "Nouvelle tâche assignée",
    message: "Mamadou Camara vous a assigné « Corriger le bug d'affichage sur mobile ».",
    read: false,
    createdAt: iso(-1 * HOUR),
  },
  {
    id: "n-2",
    userId: "u-admin",
    type: "task_completed",
    title: "Tâche terminée",
    message: "« Refonte de la page de connexion » a été marquée comme terminée.",
    read: false,
    createdAt: iso(-4 * HOUR),
  },
  {
    id: "n-3",
    userId: "u-admin",
    type: "task_comment",
    title: "Nouveau commentaire",
    message: "Aïcha Diallo a commenté « Campagne de lancement produit ».",
    read: true,
    createdAt: iso(-26 * HOUR),
  },
  {
    id: "n-4",
    userId: "u-admin",
    type: "otp_sent",
    title: "Code de vérification envoyé",
    message: "Un code OTP a été envoyé à admin@thytache.com.",
    read: true,
    createdAt: iso(-48 * HOUR),
  },
  {
    id: "n-5",
    userId: "u-admin",
    type: "task_overdue",
    title: "Tâche en retard",
    message: "« Migration de la base de données de test » a dépassé sa date limite.",
    read: false,
    createdAt: iso(-2 * HOUR),
  },
]
