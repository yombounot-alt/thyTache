import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TaskForm, taskToFormValues, type TaskFormValues } from "@/components/forms/TaskForm"
import { useTaskMutations } from "@/hooks/useTasks"
import { useAuthStore } from "@/store/authStore"
import type { Task } from "@/types/task"

interface TaskFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
}

export function TaskFormModal({ open, onOpenChange, task }: TaskFormModalProps) {
  const user = useAuthStore((s) => s.user)
  const { createTask, updateTask } = useTaskMutations()
  const isEditing = Boolean(task)

  const handleSubmit = (values: TaskFormValues) => {
    if (!user) return

    if (isEditing && task) {
      updateTask.mutate(
        { id: task.id, patch: values, actorId: user.id },
        {
          onSuccess: () => {
            toast.success("Tâche mise à jour avec succès.")
            onOpenChange(false)
          },
          onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Échec de la mise à jour de la tâche")
          },
        }
      )
      return
    }

    createTask.mutate(
      { ...values, creatorId: user.id },
      {
        onSuccess: () => {
          toast.success("Tâche créée avec succès.")
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Échec de la création de la tâche")
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier la tâche" : "Créer une nouvelle tâche"}</DialogTitle>
        </DialogHeader>
        <TaskForm
          defaultValues={task ? taskToFormValues(task) : undefined}
          onSubmit={handleSubmit}
          isSubmitting={createTask.isPending || updateTask.isPending}
          submitLabel={isEditing ? "Enregistrer les modifications" : "Créer la tâche"}
          // La règle "auto-assignation uniquement" s'applique aussi bien à la
          // création qu'à la modification côté backend.
          restrictAssigneeToSelf={user ?? undefined}
        />
      </DialogContent>
    </Dialog>
  )
}
