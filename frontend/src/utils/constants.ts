import type { TaskCategory, TaskPriority, TaskStatus } from "@/types/task"
import type { UserRole } from "@/types/user"

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "À faire",
  in_progress: "En cours",
  in_review: "En révision",
  done: "Terminée",
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-chart-2/15 text-chart-2",
  in_review: "bg-chart-5/15 text-chart-5",
  done: "bg-success/15 text-success",
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  urgent: "Urgente",
}

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-chart-2/15 text-chart-2",
  high: "bg-warning/15 text-warning",
  urgent: "bg-destructive/15 text-destructive",
}

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  development: "Développement",
  design: "Design",
  marketing: "Marketing",
  administration: "Administration",
  support: "Support",
  research: "Recherche",
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrateur",
  manager: "Manager",
  member: "Membre",
}

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-primary/15 text-primary",
  manager: "bg-chart-2/15 text-chart-2",
  member: "bg-muted text-muted-foreground",
}

export const APP_NAME = "thyTache"
