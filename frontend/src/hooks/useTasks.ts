import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { taskService, type TaskQueryParams } from "@/services/taskService"
import type { Task } from "@/types/task"

export const tasksKey = (params?: TaskQueryParams) => ["tasks", params] as const
export const taskKey = (id: string) => ["tasks", "detail", id] as const
export const taskStatsKey = ["tasks", "stats"] as const
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

export function useTaskStats() {
  return useQuery({
    queryKey: taskStatsKey,
    queryFn: () => taskService.getStats(),
  })
}

export function useTaskEvolution(days = 14) {
  return useQuery({
    queryKey: ["tasks", "evolution", days],
    queryFn: () => taskService.getEvolution(days),
  })
}

export function useStatusDistribution() {
  return useQuery({
    queryKey: ["tasks", "status-distribution"],
    queryFn: () => taskService.getStatusDistribution(),
  })
}

export function useTasksPerUser() {
  return useQuery({
    queryKey: ["tasks", "per-user"],
    queryFn: () => taskService.getTasksPerUser(),
  })
}

export function useRecentActivity(limit = 8) {
  return useQuery({
    queryKey: ["tasks", "activity", limit],
    queryFn: () => taskService.getRecentActivity(limit),
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

  return { createTask, updateTask, deleteTask, addComment, addAttachment }
}
