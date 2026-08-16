import type {
  Task,
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from "@/types/task"
import { seedUsers } from "./users"

const DAY = 24 * 3600_000
const now = Date.now()
const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString()

const memberIds = seedUsers.filter((u) => u.role !== "admin").map((u) => u.id)
const allIds = seedUsers.map((u) => u.id)

interface TaskSeed {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  category: TaskCategory
  dueOffsetDays: number | null
  createdOffsetDays: number
  assigneeIndex: number | null
  progress: number
  tags: string[]
}

const titles: TaskSeed[] = [
  {
    title: "Refonte de la page de connexion",
    description:
      "Revoir l'ergonomie du formulaire de connexion et harmoniser avec la nouvelle charte graphique dorée.",
    status: "done",
    priority: "high",
    category: "design",
    dueOffsetDays: -6,
    createdOffsetDays: -18,
    assigneeIndex: 2,
    progress: 100,
    tags: ["UI", "Auth"],
  },
  {
    title: "Intégrer l'authentification à deux facteurs",
    description: "Ajouter la vérification par code OTP envoyé par email lors de la connexion.",
    status: "in_progress",
    priority: "urgent",
    category: "development",
    dueOffsetDays: 2,
    createdOffsetDays: -10,
    assigneeIndex: 0,
    progress: 60,
    tags: ["Sécurité", "Backend"],
  },
  {
    title: "Rapport mensuel de productivité",
    description: "Compiler les statistiques de productivité de l'équipe pour le mois écoulé.",
    status: "todo",
    priority: "medium",
    category: "administration",
    dueOffsetDays: 5,
    createdOffsetDays: -2,
    assigneeIndex: 1,
    progress: 0,
    tags: ["Reporting"],
  },
  {
    title: "Campagne de lancement produit",
    description: "Préparer les visuels et le calendrier de publication pour le lancement.",
    status: "in_review",
    priority: "high",
    category: "marketing",
    dueOffsetDays: 1,
    createdOffsetDays: -8,
    assigneeIndex: 3,
    progress: 85,
    tags: ["Marketing", "Lancement"],
  },
  {
    title: "Corriger le bug d'affichage sur mobile",
    description: "Le tableau de bord affiche mal les cartes statistiques sur petits écrans.",
    status: "todo",
    priority: "urgent",
    category: "development",
    dueOffsetDays: -1,
    createdOffsetDays: -3,
    assigneeIndex: 2,
    progress: 10,
    tags: ["Bug", "Mobile"],
  },
  {
    title: "Support client - ticket #4521",
    description: "Un client signale une erreur lors de l'export de ses tâches en PDF.",
    status: "in_progress",
    priority: "medium",
    category: "support",
    dueOffsetDays: 3,
    createdOffsetDays: -1,
    assigneeIndex: 4,
    progress: 40,
    tags: ["Support"],
  },
  {
    title: "Étude concurrentielle SaaS",
    description: "Analyser les fonctionnalités phares de Linear, Notion, ClickUp et Asana.",
    status: "done",
    priority: "low",
    category: "research",
    dueOffsetDays: -15,
    createdOffsetDays: -25,
    assigneeIndex: 1,
    progress: 100,
    tags: ["Recherche"],
  },
  {
    title: "Optimiser les temps de chargement",
    description: "Réduire le poids du bundle JS et mettre en place le lazy loading des vues.",
    status: "in_progress",
    priority: "high",
    category: "development",
    dueOffsetDays: 7,
    createdOffsetDays: -5,
    assigneeIndex: 0,
    progress: 30,
    tags: ["Performance"],
  },
  {
    title: "Créer les templates d'emails transactionnels",
    description: "Concevoir les emails de bienvenue, OTP, et notifications de tâches.",
    status: "in_review",
    priority: "medium",
    category: "design",
    dueOffsetDays: 4,
    createdOffsetDays: -6,
    assigneeIndex: 3,
    progress: 75,
    tags: ["Email", "Design"],
  },
  {
    title: "Mettre à jour la politique de confidentialité",
    description: "Adapter les mentions légales suite à l'ajout du module de notifications.",
    status: "todo",
    priority: "low",
    category: "administration",
    dueOffsetDays: 10,
    createdOffsetDays: -1,
    assigneeIndex: null,
    progress: 0,
    tags: ["Légal"],
  },
  {
    title: "Réunion de cadrage - module Kanban",
    description: "Définir le périmètre fonctionnel de la vue Kanban avec glisser-déposer.",
    status: "done",
    priority: "medium",
    category: "development",
    dueOffsetDays: -20,
    createdOffsetDays: -22,
    assigneeIndex: 2,
    progress: 100,
    tags: ["Kanban"],
  },
  {
    title: "Newsletter mensuelle - août",
    description: "Rédiger et planifier l'envoi de la newsletter aux utilisateurs actifs.",
    status: "todo",
    priority: "medium",
    category: "marketing",
    dueOffsetDays: -3,
    createdOffsetDays: -4,
    assigneeIndex: 3,
    progress: 20,
    tags: ["Newsletter"],
  },
  {
    title: "Audit d'accessibilité WCAG",
    description: "Vérifier le contraste des couleurs et la navigation clavier sur tout le site.",
    status: "in_progress",
    priority: "high",
    category: "development",
    dueOffsetDays: 6,
    createdOffsetDays: -3,
    assigneeIndex: 4,
    progress: 55,
    tags: ["Accessibilité"],
  },
  {
    title: "Former l'équipe support au nouveau module",
    description: "Session de formation sur la gestion des tickets et le centre de notifications.",
    status: "todo",
    priority: "low",
    category: "support",
    dueOffsetDays: 8,
    createdOffsetDays: -1,
    assigneeIndex: 1,
    progress: 0,
    tags: ["Formation"],
  },
  {
    title: "Sondage de satisfaction utilisateurs",
    description: "Concevoir un questionnaire court pour mesurer la satisfaction sur la vue Kanban.",
    status: "in_review",
    priority: "low",
    category: "research",
    dueOffsetDays: 2,
    createdOffsetDays: -7,
    assigneeIndex: 3,
    progress: 90,
    tags: ["UX"],
  },
  {
    title: "Migration de la base de données de test",
    description: "Préparer le schéma des tâches et utilisateurs pour le futur backend Express.",
    status: "todo",
    priority: "high",
    category: "development",
    dueOffsetDays: -2,
    createdOffsetDays: -5,
    assigneeIndex: 0,
    progress: 5,
    tags: ["Backend"],
  },
  {
    title: "Créer les visuels réseaux sociaux",
    description: "Décliner l'identité visuelle du logo pour LinkedIn et Twitter/X.",
    status: "done",
    priority: "medium",
    category: "design",
    dueOffsetDays: -10,
    createdOffsetDays: -14,
    assigneeIndex: 2,
    progress: 100,
    tags: ["Branding"],
  },
  {
    title: "Documentation API pour le futur backend",
    description: "Décrire les endpoints attendus par les services frontend (tâches, users, auth).",
    status: "in_progress",
    priority: "medium",
    category: "development",
    dueOffsetDays: 9,
    createdOffsetDays: -2,
    assigneeIndex: 0,
    progress: 45,
    tags: ["Documentation"],
  },
]

function buildTask(seed: TaskSeed, index: number): Task {
  const id = `t-${index + 1}`
  const assigneeId =
    seed.assigneeIndex === null ? null : memberIds[seed.assigneeIndex % memberIds.length]
  const creatorId = allIds[(index + 1) % allIds.length]
  const createdAt = iso(seed.createdOffsetDays * DAY)
  const dueDate = seed.dueOffsetDays === null ? null : iso(seed.dueOffsetDays * DAY)
  const completedAt = seed.status === "done" ? iso((seed.dueOffsetDays ?? 0) * DAY) : null

  return {
    id,
    title: seed.title,
    description: seed.description,
    status: seed.status,
    priority: seed.priority,
    category: seed.category,
    progress: seed.progress,
    assigneeId,
    creatorId,
    createdAt,
    dueDate,
    completedAt,
    tags: seed.tags,
    comments: [
      {
        id: `${id}-c1`,
        taskId: id,
        authorId: creatorId,
        content: "N'oubliez pas de mettre à jour la description une fois terminé.",
        createdAt: iso(seed.createdOffsetDays * DAY + 2 * 3600_000),
      },
    ],
    attachments:
      index % 3 === 0
        ? [
            {
              id: `${id}-a1`,
              taskId: id,
              name: "cahier-des-charges.pdf",
              sizeKb: 842,
              type: "application/pdf",
              uploadedById: creatorId,
              uploadedAt: iso(seed.createdOffsetDays * DAY + 3600_000),
            },
          ]
        : [],
    history: [
      {
        id: `${id}-h1`,
        taskId: id,
        actorId: creatorId,
        action: "created",
        detail: "Tâche créée",
        createdAt,
      },
      ...(seed.status === "done"
        ? [
            {
              id: `${id}-h2`,
              taskId: id,
              actorId: assigneeId ?? creatorId,
              action: "completed",
              detail: "Tâche marquée comme terminée",
              createdAt: completedAt ?? createdAt,
            },
          ]
        : []),
    ],
  }
}

export const seedTasks: Task[] = titles.map(buildTask)
