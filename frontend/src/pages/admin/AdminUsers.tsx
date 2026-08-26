import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchInput } from "@/components/shared/SearchInput"
import { Pagination } from "@/components/shared/Pagination"
import { UsersTable } from "@/components/tables/UsersTable"
import { UserFormModal } from "@/components/modals/UserFormModal"
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal"
import { useUserMutations, useUsersQuery } from "@/hooks/useUsers"
import type { User } from "@/types/user"

export default function AdminUsers() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>()
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const { data, isLoading } = useUsersQuery({ search: search || undefined, page, pageSize: 8 })
  const { deleteUser, toggleStatus, resetPassword } = useUserMutations()

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-brand text-2xl font-semibold">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">Gérez les comptes de votre organisation.</p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(undefined)
            setFormOpen(true)
          }}
        >
          <PlusIcon /> Nouvel utilisateur
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        placeholder="Rechercher un utilisateur..."
        className="max-w-xs"
      />

      <Card className="py-4">
        <CardContent className="px-4">
          {isLoading || !data ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data.data.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Aucun utilisateur trouvé.</p>
          ) : (
            <>
              <UsersTable
                users={data.data}
                onEdit={(user) => {
                  setEditingUser(user)
                  setFormOpen(true)
                }}
                onDelete={(user) => setDeletingUser(user)}
                onToggleStatus={(user) =>
                  toggleStatus.mutate(user.id, {
                    onSuccess: () =>
                      toast.success(
                        user.status === "active" ? "Utilisateur désactivé." : "Utilisateur activé."
                      ),
                  })
                }
                onResetPassword={(user) =>
                  resetPassword.mutate(user.id, {
                    onSuccess: ({ temporaryPassword }) =>
                      toast.success(`Mot de passe temporaire généré : ${temporaryPassword}`),
                  })
                }
              />
              <Pagination meta={data.meta} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      <UserFormModal open={formOpen} onOpenChange={setFormOpen} user={editingUser} />
      <ConfirmDeleteModal
        open={Boolean(deletingUser)}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        title="Supprimer cet utilisateur ?"
        description={`${deletingUser?.firstName} ${deletingUser?.lastName} perdra définitivement l'accès à l'application.`}
        onConfirm={() => {
          if (!deletingUser) return
          deleteUser.mutate(deletingUser.id, {
            onSuccess: () => {
              toast.success("Utilisateur supprimé.")
              setDeletingUser(null)
            },
          })
        }}
        isLoading={deleteUser.isPending}
      />
    </div>
  )
}
