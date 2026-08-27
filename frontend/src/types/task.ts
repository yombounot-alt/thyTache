export type TaskStatus = "todo" | "in_progress" | "in_review" | "done"
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type TaskCategory =
  | "development"
  | "design"
  | "marketing"
  | "administration"
  | "support"
  | "research"

export interface TaskComment {
  id: string
  taskId: string
  authorId: string
  content: string
  createdAt: string
}

export interface TaskAttachment {
  id: string
  taskId: string
  name: string
  sizeKb: number
  type: string
  uploadedById: string
  uploadedAt: string
}

export interface TaskHistoryEntry {
  id: string
  taskId: string
  actorId: string
  action: string
  detail?: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  category: TaskCategory
  progress: number
  assigneeId: string | null
  creatorId: string
  createdAt: string
  dueDate: string | null
  completedAt: string | null
  tags: string[]
  comments: TaskComment[]
  attachments: TaskAttachment[]
  history: TaskHistoryEntry[]
}

export interface TaskFilters {
  search?: string
  status?: TaskStatus[]
  priority?: TaskPriority[]
  category?: TaskCategory[]
  assigneeId?: string
  // Admin uniquement : "all" retourne les tâches de toute la plateforme.
  // Ignoré côté backend pour un utilisateur standard (toujours "mine").
  scope?: "all" | "mine"
}

export interface TaskStats {
  total: number
  completed: number
  inProgress: number
  pending: number
  overdue: number
}

export type TaskViewMode = "list" | "kanban" | "calendar" | "cards"
