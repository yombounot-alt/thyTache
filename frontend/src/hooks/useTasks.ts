import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { taskService, type TaskQueryParams } from "@/services/taskService"
import type { Task, TaskFilters } from "@/types/task"

export const tasksKey = (params?: TaskQueryParams) => ["tasks", params] as const
export const taskKey = (id: string) => ["tasks", "detail", id] as const
export const taskStatsKey = (scope?: TaskFilters["scope"]) => ["tasks", "stats", scope] as const
export const allTasksKey = (filters?: object) => ["tasks", "all", filters] as const

export function useTasksQuery(params: TaskQueryParams = {}) {
  return useQuery({
    queryKey: tasksKey(params),
    queryFn: () => taskService.list(params),
  })
}

export function useAllTasksQuery(filters: Parameters<typeof taskService.listAll>[0] = {}) {
  return useQuery({
    queryKey: allTasksKey(filters),
    queryFn: () => taskService.listAll(filters),
  })
}

export function useTaskQuery(id: string | undefined) {
  return useQuery({
    queryKey: taskKey(id ?? ""),
    queryFn: () => taskService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useTaskStats(scope?: TaskFilters["scope"]) {
  return useQuery({
    queryKey: taskStatsKey(scope),
    queryFn: () => taskService.getStats(scope),
  })
}

export function useTaskEvolution(days = 14, scope?: TaskFilters["scope"]) {
  return useQuery({
    queryKey: ["tasks", "evolution", days, scope],
    queryFn: () => taskService.getEvolution(days, scope),
  })
}

export function useStatusDistribution(scope?: TaskFilters["scope"]) {
  return useQuery({
    queryKey: ["tasks", "status-distribution", scope],
    queryFn: () => taskService.getStatusDistribution(scope),
  })
}

export function useTasksPerUser(scope?: TaskFilters["scope"]) {
  return useQuery({
    queryKey: ["tasks", "per-user", scope],
    queryFn: () => taskService.getTasksPerUser(scope),
  })
}

export function useRecentActivity(limit = 8, scope?: TaskFilters["scope"]) {
  return useQuery({
    queryKey: ["tasks", "activity", limit, scope],
    queryFn: () => taskService.getRecentActivity(limit, scope),
  })
}

export function useTrashedTasksQuery() {
  return useQuery({
    queryKey: ["tasks", "trash"],
    queryFn: () => taskService.listTrash(),
  })
}

export function useTaskMutations() {
  const queryClient = useQueryClient()

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["tasks"] })
  }

  const createTask = useMutation({
    mutationFn: taskService.create,
    onSuccess: invalidateAll,
  })

  const updateTask = useMutation({
    mutationFn: ({
      id,
      patch,
      actorId,
    }: {
      id: string
      patch: Partial<Task>
      actorId: string
    }) => taskService.update(id, patch, actorId),
    onSuccess: invalidateAll,
  })

  const deleteTask = useMutation({
    mutationFn: (id: string) => taskService.remove(id),
    onSuccess: invalidateAll,
  })

  const restoreTask = useMutation({
    mutationFn: (id: string) => taskService.restore(id),
    onSuccess: invalidateAll,
  })

  const addComment = useMutation({
    mutationFn: ({
      taskId,
      authorId,
      content,
    }: {
      taskId: string
      authorId: string
      content: string
    }) => taskService.addComment(taskId, authorId, content),
    onSuccess: invalidateAll,
  })

  const addAttachment = useMutation({
    mutationFn: ({
      taskId,
      uploadedById,
      file,
    }: {
      taskId: string
      uploadedById: string
      file: { name: string; sizeKb: number; type: string }
    }) => taskService.addAttachment(taskId, uploadedById, file),
    onSuccess: invalidateAll,
  })

  return { createTask, updateTask, deleteTask, restoreTask, addComment, addAttachment }
}
