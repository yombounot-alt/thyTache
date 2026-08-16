import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { FilterBar } from "@/components/shared/FilterBar"
import { TaskViewSwitcher } from "@/components/shared/TaskViewSwitcher"
import { TaskCard } from "@/components/cards/TaskCard"
import { TaskDetailModal } from "@/components/modals/TaskDetailModal"
import { TaskFormModal } from "@/components/modals/TaskFormModal"
import { cn } from "@/lib/utils"
import { useTaskFilters } from "@/hooks/useTaskFilters"
import { useAllTasksQuery, useTaskMutations } from "@/hooks/useTasks"
import { useAllUsersQuery } from "@/hooks/useUsers"
import { useAuthStore } from "@/store/authStore"
import { TASK_STATUS_LABELS } from "@/utils/constants"
import type { Task, TaskStatus } from "@/types/task"

const COLUMNS: { status: TaskStatus; accent: string }[] = [
  { status: "todo", accent: "bg-muted-foreground" },
  { status: "in_progress", accent: "bg-chart-2" },
  { status: "in_review", accent: "bg-chart-5" },
  { status: "done", accent: "bg-success" },
]

export default function TaskKanbanPage() {
  const { search, setSearch, status, setStatus, priority, setPriority, category, setCategory, filters } =
    useTaskFilters()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)

  const { data: tasks, isLoading } = useAllTasksQuery(filters)
  const { data: users } = useAllUsersQuery()
  const usersById = new Map((users ?? []).map((u) => [u.id, u]))
  const { updateTask } = useTaskMutations()
  const user = useAuthStore((s) => s.user)

  const tasksByStatus = (columnStatus: TaskStatus): Task[] =>
    (tasks ?? []).filter((t) => t.status === columnStatus)

  const handleDrop = (columnStatus: TaskStatus) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOverColumn(null)
    const taskId = e.dataTransfer.getData("text/plain")
    const task = tasks?.find((t) => t.id === taskId)
    if (!task || !user || task.status === columnStatus) return

    updateTask.mutate(
      { id: taskId, patch: { status: columnStatus }, actorId: user.id },
      {
        onSuccess: () =>
          toast.success(`« ${task.title} » déplacée vers ${TASK_STATUS_LABELS[columnStatus]}.`),
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Échec du déplacement de la tâche")
        },
      }
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-brand text-2xl font-semibold">Tâches — Vue Kanban</h1>
          <p className="text-sm text-muted-foreground">Glissez-déposez les tâches pour changer leur statut.</p>
        </div>
        <div className="flex items-center gap-2">
          <TaskViewSwitcher />
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon /> Nouvelle tâche
          </Button>
        </div>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        category={category}
        onCategoryChange={setCategory}
      />

      {isLoading || !tasks ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 overflow-x-auto md:grid-cols-4">
          {COLUMNS.map((column) => {
            const columnTasks = tasksByStatus(column.status)
            return (
              <div
                key={column.status}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverColumn(column.status)
                }}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={handleDrop(column.status)}
                className={cn(
                  "flex min-h-24 flex-col gap-3 rounded-xl border border-border bg-secondary/30 p-3 transition-colors",
                  dragOverColumn === column.status && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-center gap-2 px-1">
                  <span className={cn("size-2 rounded-full", column.accent)} />
                  <p className="text-sm font-semibold">{TASK_STATUS_LABELS[column.status]}</p>
                  <Badge variant="outline" className="ml-auto">
                    {columnTasks.length}
                  </Badge>
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      assignee={task.assigneeId ? usersById.get(task.assigneeId) : undefined}
                      onClick={() => setSelectedTaskId(task.id)}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", task.id)}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                      Aucune tâche
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <TaskDetailModal taskId={selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)} />
      <TaskFormModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
