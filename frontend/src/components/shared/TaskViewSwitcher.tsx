import { Link, useLocation } from "react-router-dom"
import { CalendarDaysIcon, KanbanSquareIcon, LayoutGridIcon, ListTodoIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const views = [
  { path: "/tasks", label: "Liste", icon: ListTodoIcon },
  { path: "/tasks/kanban", label: "Kanban", icon: KanbanSquareIcon },
  { path: "/tasks/calendar", label: "Calendrier", icon: CalendarDaysIcon },
  { path: "/tasks/cards", label: "Cartes", icon: LayoutGridIcon },
]

export function TaskViewSwitcher() {
  const { pathname } = useLocation()

  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
      {views.map((view) => {
        const isActive = pathname === view.path
        return (
          <Link
            key={view.path}
            to={view.path}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <view.icon className="size-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
