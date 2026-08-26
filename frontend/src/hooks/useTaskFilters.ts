import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import type { TaskCategory, TaskPriority, TaskStatus } from "@/types/task"

export function useTaskFilters() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [status, setStatus] = useState<TaskStatus[]>([])
  const [priority, setPriority] = useState<TaskPriority[]>([])
  const [category, setCategory] = useState<TaskCategory[]>([])
  const [page, setPage] = useState(1)

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: status.length ? status : undefined,
      priority: priority.length ? priority : undefined,
      category: category.length ? category : undefined,
    }),
    [search, status, priority, category]
  )

  return {
    search,
    setSearch: (v: string) => {
      setSearch(v)
      setPage(1)
    },
    status,
    setStatus: (v: TaskStatus[]) => {
      setStatus(v)
      setPage(1)
    },
    priority,
    setPriority: (v: TaskPriority[]) => {
      setPriority(v)
      setPage(1)
    },
    category,
    setCategory: (v: TaskCategory[]) => {
      setCategory(v)
      setPage(1)
    },
    page,
    setPage,
    filters,
  }
}
