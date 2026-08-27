import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterBar } from "@/components/shared/FilterBar"
import { Pagination } from "@/components/shared/Pagination"
import { TasksTable } from "@/components/tables/TasksTable"
import { TaskDetailModal } from "@/components/modals/TaskDetailModal"
import { TaskFormModal } from "@/components/modals/TaskFormModal"
import { useTaskFilters } from "@/hooks/useTaskFilters"
import { useTasksQuery } from "@/hooks/useTasks"
import { useAllUsersQuery } from "@/hooks/useUsers"
import type { TaskFilters } from "@/types/task"

export default function AdminTasks() {
  const {
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,
    category,
    setCategory,
    page,
    setPage,
    filters,
  } = useTaskFilters()
  const [scope, setScope] = useState<NonNullable<TaskFilters["scope"]>>("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading } = useTasksQuery({ ...filters, scope, page, pageSize: 8, sortBy, sortDir })
  const { data: users } = useAllUsersQuery()
  const usersById = new Map((users ?? []).map((u) => [u.id, u]))

  const handleScopeChange = (value: string) => {
    setScope(value as NonNullable<TaskFilters["scope"]>)
    setPage(1)
  }

  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(column)
      setSortDir("asc")
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-brand text-2xl font-semibold">Toutes les tâches</h1>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble et gestion de toutes les tâches de l'organisation.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon /> Nouvelle tâche
        </Button>
      </div>

      <Tabs value={scope} onValueChange={handleScopeChange}>
        <TabsList>
          <TabsTrigger value="all">Toutes les tâches</TabsTrigger>
          <TabsTrigger value="mine">Mes tâches</TabsTrigger>
        </TabsList>
      </Tabs>

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

      <Card className="py-4">
        <CardContent className="px-4">
          {isLoading || !data ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data.data.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucune tâche ne correspond à vos critères.
            </p>
          ) : (
            <>
              <TasksTable
                tasks={data.data}
                usersById={usersById}
                onRowClick={setSelectedTaskId}
                sortBy={sortBy}
                sortDir={sortDir}
                onSortChange={handleSortChange}
                showCreator={scope === "all"}
              />
              <Pagination meta={data.meta} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      <TaskDetailModal taskId={selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)} />
      <TaskFormModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
