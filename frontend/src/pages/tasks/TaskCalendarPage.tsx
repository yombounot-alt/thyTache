import { useMemo, useState } from "react"
import { PlusIcon } from "lucide-react"
import { format, isSameDay, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TaskViewSwitcher } from "@/components/shared/TaskViewSwitcher"
import { TaskCard } from "@/components/cards/TaskCard"
import { TaskDetailModal } from "@/components/modals/TaskDetailModal"
import { TaskFormModal } from "@/components/modals/TaskFormModal"
import { useAllTasksQuery } from "@/hooks/useTasks"
import { useAllUsersQuery } from "@/hooks/useUsers"

export default function TaskCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: tasks, isLoading } = useAllTasksQuery()
  const { data: users } = useAllUsersQuery()
  const usersById = new Map((users ?? []).map((u) => [u.id, u]))

  const tasksWithDueDate = useMemo(() => (tasks ?? []).filter((t) => t.dueDate), [tasks])
  const daysWithTasks = useMemo(
    () => tasksWithDueDate.map((t) => parseISO(t.dueDate as string)),
    [tasksWithDueDate]
  )

  const tasksForSelectedDay = tasksWithDueDate.filter((t) =>
    isSameDay(parseISO(t.dueDate as string), selectedDate)
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-brand text-2xl font-semibold">Tâches — Vue Calendrier</h1>
          <p className="text-sm text-muted-foreground">Visualisez les échéances de vos tâches par jour.</p>
        </div>
        <div className="flex items-center gap-2">
          <TaskViewSwitcher />
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon /> Nouvelle tâche
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
          <Card className="w-fit">
            <CardContent className="p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={fr}
                modifiers={{ hasTasks: daysWithTasks }}
                modifiersClassNames={{
                  hasTasks: "after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary",
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Échéances du {format(selectedDate, "d MMMM yyyy", { locale: fr })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksForSelectedDay.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Aucune tâche avec échéance ce jour-là.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {tasksForSelectedDay.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      assignee={task.assigneeId ? usersById.get(task.assigneeId) : undefined}
                      onClick={() => setSelectedTaskId(task.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <TaskDetailModal taskId={selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)} />
      <TaskFormModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
