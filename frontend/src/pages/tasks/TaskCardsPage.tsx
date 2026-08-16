import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FilterBar } from "@/components/shared/FilterBar"
import { TaskViewSwitcher } from "@/components/shared/TaskViewSwitcher"
import { TaskCard } from "@/components/cards/TaskCard"
import { TaskDetailModal } from "@/components/modals/TaskDetailModal"
import { TaskFormModal } from "@/components/modals/TaskFormModal"
import { useTaskFilters } from "@/hooks/useTaskFilters"
import { useAllTasksQuery } from "@/hooks/useTasks"
import { useAllUsersQuery } from "@/hooks/useUsers"

export default function TaskCardsPage() {
  const { search, setSearch, status, setStatus, priority, setPriority, category, setCategory, filters } =
    useTaskFilters()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: tasks, isLoading } = useAllTasksQuery(filters)
  const { data: users } = useAllUsersQuery()
  const usersById = new Map((users ?? []).map((u) => [u.id, u]))

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-brand text-2xl font-semibold">Tâches — Vue Cartes</h1>
          <p className="text-sm text-muted-foreground">Parcourez vos tâches sous forme de cartes visuelles.</p>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Aucune tâche ne correspond à vos critères.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={task.assigneeId ? usersById.get(task.assigneeId) : undefined}
              onClick={() => setSelectedTaskId(task.id)}
            />
          ))}
        </div>
      )}

      <TaskDetailModal taskId={selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)} />
      <TaskFormModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
