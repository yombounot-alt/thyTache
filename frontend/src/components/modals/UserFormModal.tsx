import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserForm, type UserFormValues } from "@/components/forms/UserForm"
import { useUserMutations } from "@/hooks/useUsers"
import type { User } from "@/types/user"

interface UserFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User
}

export function UserFormModal({ open, onOpenChange, user }: UserFormModalProps) {
  const { createUser, updateUser } = useUserMutations()
  const isEditing = Boolean(user)

  const handleSubmit = (values: UserFormValues) => {
    if (isEditing && user) {
      updateUser.mutate(
        { id: user.id, patch: values },
        {
          onSuccess: () => {
            toast.success("Utilisateur mis à jour.")
            onOpenChange(false)
          },
        }
      )
      return
    }

    createUser.mutate(values, {
      onSuccess: () => {
        toast.success("Utilisateur créé avec succès.")
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier l'utilisateur" : "Créer un utilisateur"}</DialogTitle>
        </DialogHeader>
        <UserForm
          defaultValues={user}
          onSubmit={handleSubmit}
          isSubmitting={createUser.isPending || updateUser.isPending}
          submitLabel={isEditing ? "Enregistrer" : "Créer l'utilisateur"}
        />
      </DialogContent>
    </Dialog>
  )
}
