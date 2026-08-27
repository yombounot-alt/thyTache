import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, initials, isOverdue } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  TASK_PRIORITY_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
} from "@/utils/constants"
import type { Task } from "@/types/task"
import type { User } from "@/types/user"

interface TasksTableProps {
  tasks: Task[]
  usersById: Map<string, User>
  onRowClick: (taskId: string) => void
  sortBy: string
  sortDir: "asc" | "desc"
  onSortChange: (column: string) => void
  // Vue admin "Toutes les tâches" : le créateur varie d'une tâche à l'autre,
  // il faut donc l'identifier clairement (contrairement à "Mes tâches", où
  // le créateur est toujours l'utilisateur connecté).
  showCreator?: boolean
}

function SortableHead({
  column,
  label,
  sortBy,
  sortDir,
  onSortChange,
}: {
  column: string
  label: string
  sortBy: string
  sortDir: "asc" | "desc"
  onSortChange: (column: string) => void
}) {
  const isActive = sortBy === column
  const Icon = isActive ? (sortDir === "asc" ? ArrowUpIcon : ArrowDownIcon) : ArrowUpDownIcon

  return (
    <TableHead>
      <button
        onClick={() => onSortChange(column)}
        className="flex items-center gap-1 cursor-pointer hover:text-foreground"
      >
        {label}
        <Icon className={cn("size-3", isActive ? "text-foreground" : "text-muted-foreground/50")} />
      </button>
    </TableHead>
  )
}

export function TasksTable({
  tasks,
  usersById,
  onRowClick,
  sortBy,
  sortDir,
  onSortChange,
  showCreator,
}: TasksTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHead column="title" label="Tâche" sortBy={sortBy} sortDir={sortDir} onSortChange={onSortChange} />
          <SortableHead column="status" label="Statut" sortBy={sortBy} sortDir={sortDir} onSortChange={onSortChange} />
          <SortableHead column="priority" label="Priorité" sortBy={sortBy} sortDir={sortDir} onSortChange={onSortChange} />
          {showCreator && <TableHead>Créateur</TableHead>}
          <TableHead>Assigné à</TableHead>
          <SortableHead column="dueDate" label="Échéance" sortBy={sortBy} sortDir={sortDir} onSortChange={onSortChange} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const assignee = task.assigneeId ? usersById.get(task.assigneeId) : undefined
          const creator = usersById.get(task.creatorId)
          const overdue = task.status !== "done" && isOverdue(task.dueDate)

          return (
            <TableRow key={task.id} onClick={() => onRowClick(task.id)} className="cursor-pointer">
              <TableCell className="max-w-70 whitespace-normal">
                <p className="line-clamp-1 font-medium">{task.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{task.description}</p>
              </TableCell>
              <TableCell>
                <Badge className={TASK_STATUS_COLORS[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={TASK_PRIORITY_COLORS[task.priority]}>{TASK_PRIORITY_LABELS[task.priority]}</Badge>
              </TableCell>
              {showCreator && (
                <TableCell>
                  {creator ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px]">
                          {initials(creator.firstName, creator.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{creator.firstName}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}
              <TableCell>
                {assignee ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px]">
                        {initials(assignee.firstName, assignee.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{assignee.firstName}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className={overdue ? "font-medium text-destructive" : ""}>
                {formatDate(task.dueDate)}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
