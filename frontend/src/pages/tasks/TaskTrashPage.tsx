import { toast } from "sonner"
import { RotateCcwIcon, Trash2Icon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, initials } from "@/lib/format"
import { useTaskMutations, useTrashedTasksQuery } from "@/hooks/useTasks"
import { useAllUsersQuery } from "@/hooks/useUsers"
import { TASK_CATEGORY_LABELS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from "@/utils/constants"

export default function TaskTrashPage() {
  const { data: tasks, isLoading } = useTrashedTasksQuery()
  const { data: users } = useAllUsersQuery()
  const { restoreTask } = useTaskMutations()

  const usersById = new Map((users ?? []).map((u) => [u.id, u]))

  const handleRestore = (taskId: string, title: string) => {
    restoreTask.mutate(taskId, {
      onSuccess: () => toast.success(`« ${title} » a été restaurée.`),
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Impossible de restaurer cette tâche.")
      },
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-brand text-2xl font-semibold">Corbeille</h1>
        <p className="text-sm text-muted-foreground">
          Tâches supprimées, conservées ici jusqu'à ce que vous les restauriez.
        </p>
      </div>

      <Card className="py-0">
        <CardContent className="p-0">
          {isLoading || !tasks ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Trash2Icon className="size-6" />
              </div>
              <p className="text-sm text-muted-foreground">La corbeille est vide.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tasks.map((task) => {
                const deletedBy = task.deletedById ? usersById.get(task.deletedById) : undefined
                const isRestoring = restoreTask.isPending && restoreTask.variables === task.id

                return (
                  <div key={task.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{task.title}</p>
                        <Badge className={TASK_STATUS_COLORS[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
                        <Badge variant="outline">{TASK_CATEGORY_LABELS[task.category]}</Badge>
                      </div>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{task.description}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>Supprimée le {formatDate(task.deletedAt)}</span>
                        {deletedBy && (
                          <>
                            <span>·</span>
                            <Avatar className="size-4">
                              <AvatarFallback className="text-[8px]">
                                {initials(deletedBy.firstName, deletedBy.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {deletedBy.firstName} {deletedBy.lastName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isRestoring}
                      onClick={() => handleRestore(task.id, task.title)}
                      className="gap-1.5"
                    >
                      <RotateCcwIcon className={isRestoring ? "animate-spin" : ""} />
                      Restaurer
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
