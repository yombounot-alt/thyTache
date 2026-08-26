import { CalendarIcon, MessageSquareIcon, PaperclipIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatDate, initials, isOverdue } from "@/lib/format"
import { cn } from "@/lib/utils"
import { TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from "@/utils/constants"
import type { Task } from "@/types/task"
import type { User } from "@/types/user"

interface TaskCardProps {
  task: Task
  assignee?: User
  onClick: () => void
  draggable?: boolean
  onDragStart?: React.DragEventHandler<HTMLDivElement>
}

export function TaskCard({ task, assignee, onClick, draggable, onDragStart }: TaskCardProps) {
  const overdue = task.status !== "done" && isOverdue(task.dueDate)

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className={cn(
        "cursor-pointer space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        draggable && "active:cursor-grabbing"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-medium">{task.title}</p>
        <Badge className={cn("shrink-0", TASK_PRIORITY_COLORS[task.priority])}>
          {TASK_PRIORITY_LABELS[task.priority]}
        </Badge>
      </div>

      <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>

      <Progress value={task.progress} className="h-1.5" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquareIcon className="size-3.5" /> {task.comments.length}
            </span>
          )}
          {task.attachments.length > 0 && (
            <span className="flex items-center gap-1">
              <PaperclipIcon className="size-3.5" /> {task.attachments.length}
            </span>
          )}
          {task.dueDate && (
            <span className={cn("flex items-center gap-1", overdue && "font-medium text-destructive")}>
              <CalendarIcon className="size-3.5" /> {formatDate(task.dueDate, "d MMM")}
            </span>
          )}
        </div>
        {assignee && (
          <Avatar className="size-6">
            <AvatarFallback className="text-[10px]">
              {initials(assignee.firstName, assignee.lastName)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}
