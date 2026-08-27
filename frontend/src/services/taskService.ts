import { api } from "@/lib/axios"
import { toApiError } from "@/lib/apiError"
import type { PaginatedResponse, PaginationParams } from "@/types/api"
import type { Task, TaskFilters, TaskStats } from "@/types/task"

interface BackendComment {
  id: string
  authorId: string
  content: string
  createdAt: string
}

interface BackendAttachment {
  id: string
  name: string
  sizeKb: number
  type: string
  uploadedById: string
  uploadedAt: string
}

interface BackendHistoryEntry {
  id: string
  actorId: string
  action: string
  detail?: string
  createdAt: string
}

interface BackendTask {
  _id: string
  title: string
  description: string
  status: Task["status"]
  priority: Task["priority"]
  category: Task["category"]
  progress: number
  assigneeId: string | null
  creatorId: string
  dueDate: string | null
  completedAt: string | null
  tags: string[]
  createdAt: string
  comments: BackendComment[]
  attachments: BackendAttachment[]
  history: BackendHistoryEntry[]
}

function mapBackendTask(raw: BackendTask): Task {
  return {
    id: raw._id,
    title: raw.title,
    description: raw.description,
    status: raw.status,
    priority: raw.priority,
    category: raw.category,
    progress: raw.progress,
    assigneeId: raw.assigneeId,
    creatorId: raw.creatorId,
    createdAt: raw.createdAt,
    dueDate: raw.dueDate,
    completedAt: raw.completedAt,
    tags: raw.tags,
    comments: raw.comments.map((c) => ({
      id: c.id,
      taskId: raw._id,
      authorId: c.authorId,
      content: c.content,
      createdAt: c.createdAt,
    })),
    attachments: raw.attachments.map((a) => ({
      id: a.id,
      taskId: raw._id,
      name: a.name,
      sizeKb: a.sizeKb,
      type: a.type,
      uploadedById: a.uploadedById,
      uploadedAt: a.uploadedAt,
    })),
    history: raw.history.map((h) => ({
      id: h.id,
      taskId: raw._id,
      actorId: h.actorId,
      action: h.action,
      detail: h.detail,
      createdAt: h.createdAt,
    })),
  }
}

export interface TaskQueryParams extends PaginationParams, TaskFilters {}

export const taskService = {
  async list(params: TaskQueryParams = {}): Promise<PaginatedResponse<Task>> {
    try {
      const { data } = await api.get("/tasks", { params })
      return { data: (data.data.data as BackendTask[]).map(mapBackendTask), meta: data.data.meta }
    } catch (error) {
      throw toApiError(error, "Échec du chargement des tâches")
    }
  },

  // Pas de route backend "sans pagination" dédiée : on demande la plus
  // grande page autorisée par l'API (100) et on ignore la pagination.
  async listAll(filters: TaskFilters = {}): Promise<Task[]> {
    try {
      const { data } = await api.get("/tasks", { params: { ...filters, page: 1, pageSize: 100 } })
      return (data.data.data as BackendTask[]).map(mapBackendTask)
    } catch (error) {
      throw toApiError(error, "Échec du chargement des tâches")
    }
  },

  async getById(id: string): Promise<Task> {
    try {
      const { data } = await api.get(`/tasks/${id}`)
      return mapBackendTask(data.data)
    } catch (error) {
      throw toApiError(error, "Tâche introuvable")
    }
  },

  async create(
    input: Pick<
      Task,
      "title" | "description" | "priority" | "category" | "assigneeId" | "dueDate" | "tags"
    > & { creatorId: string }
  ): Promise<Task> {
    try {
      const { data } = await api.post("/tasks", {
        title: input.title,
        description: input.description,
        priority: input.priority,
        category: input.category,
        assigneeId: input.assigneeId,
        dueDate: input.dueDate,
        tags: input.tags,
      })
      return mapBackendTask(data.data)
    } catch (error) {
      throw toApiError(error, "Échec de la création de la tâche")
    }
  },

  // `actorId` n'est plus transmis : le backend identifie l'auteur via le
  // token JWT. Conservé dans la signature pour ne pas casser les appelants.
  async update(id: string, patch: Partial<Task>, _actorId: string): Promise<Task> {
    try {
      const { data } = await api.patch(`/tasks/${id}`, {
        title: patch.title,
        description: patch.description,
        category: patch.category,
        priority: patch.priority,
        status: patch.status,
        progress: patch.progress,
        assigneeId: patch.assigneeId,
        dueDate: patch.dueDate,
        tags: patch.tags,
      })
      return mapBackendTask(data.data)
    } catch (error) {
      throw toApiError(error, "Échec de la mise à jour de la tâche")
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`/tasks/${id}`)
    } catch (error) {
      throw toApiError(error, "Impossible de supprimer cette tâche.")
    }
  },

  async addComment(taskId: string, _authorId: string, content: string): Promise<Task> {
    try {
      const { data } = await api.post(`/tasks/${taskId}/comments`, { content })
      return mapBackendTask(data.data)
    } catch (error) {
      throw toApiError(error, "Échec de l'ajout du commentaire")
    }
  },

  async addAttachment(
    taskId: string,
    _uploadedById: string,
    file: { name: string; sizeKb: number; type: string }
  ): Promise<Task> {
    try {
      const { data } = await api.post(`/tasks/${taskId}/attachments`, file)
      return mapBackendTask(data.data)
    } catch (error) {
      throw toApiError(error, "Échec de l'ajout de la pièce jointe")
    }
  },

  async getEvolution(
    days = 14,
    scope?: TaskFilters["scope"]
  ): Promise<Array<{ date: string; created: number; completed: number }>> {
    try {
      const { data } = await api.get("/tasks/evolution", { params: { days, scope } })
      return data.data
    } catch (error) {
      throw toApiError(error, "Échec du chargement de l'évolution des tâches")
    }
  },

  async getRecentActivity(
    limit = 8,
    scope?: TaskFilters["scope"]
  ): Promise<
    Array<{ id: string; taskId: string; taskTitle: string; actorId: string; action: string; detail?: string; createdAt: string }>
  > {
    try {
      const { data } = await api.get("/tasks/activity", { params: { limit, scope } })
      return data.data
    } catch (error) {
      throw toApiError(error, "Échec du chargement de l'activité récente")
    }
  },

  async getStatusDistribution(
    scope?: TaskFilters["scope"]
  ): Promise<Array<{ status: Task["status"]; count: number }>> {
    try {
      const { data } = await api.get("/tasks/status-distribution", { params: { scope } })
      return data.data
    } catch (error) {
      throw toApiError(error, "Échec du chargement de la répartition par statut")
    }
  },

  async getTasksPerUser(scope?: TaskFilters["scope"]): Promise<Array<{ userId: string; count: number }>> {
    try {
      const { data } = await api.get("/tasks/assignees-distribution", { params: { scope } })
      return data.data
    } catch (error) {
      throw toApiError(error, "Échec du chargement de la répartition par assigné")
    }
  },

  async getStats(scope?: TaskFilters["scope"]): Promise<TaskStats> {
    try {
      const { data } = await api.get("/tasks/stats", { params: { scope } })
      return data.data
    } catch (error) {
      throw toApiError(error, "Échec du chargement des statistiques")
    }
  },
}
