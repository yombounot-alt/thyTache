import { CheckCircle2Icon, PencilIcon, PlusIcon } from "lucide-react"

import { formatRelative } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { User } from "@/types/user"

interface ActivityEntry {
  id: string
  taskId: string
  taskTitle: string
  actorId: string
  action: string
  detail?: string
  createdAt: string
}

const ACTION_ICONS: Record<string, typeof PlusIcon> = {
  created: PlusIcon,
  updated: PencilIcon,
  completed: CheckCircle2Icon,
}

const ACTION_COLORS: Record<string, string> = {
  created: "bg-chart-2/15 text-chart-2",
  updated: "bg-chart-5/15 text-chart-5",
  completed: "bg-success/15 text-success",
}

export function ActivityCard({ entry, actor }: { entry: ActivityEntry; actor?: User }) {
  const Icon = ACTION_ICONS[entry.action] ?? PencilIcon

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          ACTION_COLORS[entry.action] ?? "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{actor ? `${actor.firstName} ${actor.lastName}` : "Quelqu'un"}</span>{" "}
          <span className="text-muted-foreground">{entry.detail?.toLowerCase() ?? entry.action}</span>{" "}
          <span className="font-medium">« {entry.taskTitle} »</span>
        </p>
        <p className="text-xs text-muted-foreground">{formatRelative(entry.createdAt)}</p>
      </div>
    </div>
  )
}
