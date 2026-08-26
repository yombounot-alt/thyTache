import { FilterIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/shared/SearchInput"
import {
  TASK_CATEGORY_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/utils/constants"
import type { TaskCategory, TaskPriority, TaskStatus } from "@/types/task"

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  status: TaskStatus[]
  onStatusChange: (value: TaskStatus[]) => void
  priority: TaskPriority[]
  onPriorityChange: (value: TaskPriority[]) => void
  category: TaskCategory[]
  onCategoryChange: (value: TaskCategory[]) => void
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
}: FilterBarProps) {
  const activeCount = status.length + priority.length + category.length

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput value={search} onChange={onSearchChange} placeholder="Rechercher une tâche..." className="sm:max-w-xs" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1.5">
            <FilterIcon className="size-4" /> Filtres
            {activeCount > 0 && (
              <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Statut</DropdownMenuLabel>
          {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((key) => (
            <DropdownMenuCheckboxItem
              key={key}
              checked={status.includes(key)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => onStatusChange(toggle(status, key))}
            >
              {TASK_STATUS_LABELS[key]}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Priorité</DropdownMenuLabel>
          {(Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]).map((key) => (
            <DropdownMenuCheckboxItem
              key={key}
              checked={priority.includes(key)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => onPriorityChange(toggle(priority, key))}
            >
              {TASK_PRIORITY_LABELS[key]}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Catégorie</DropdownMenuLabel>
          {(Object.keys(TASK_CATEGORY_LABELS) as TaskCategory[]).map((key) => (
            <DropdownMenuCheckboxItem
              key={key}
              checked={category.includes(key)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => onCategoryChange(toggle(category, key))}
            >
              {TASK_CATEGORY_LABELS[key]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
