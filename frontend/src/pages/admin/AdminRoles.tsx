import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { initials } from "@/lib/format"
import { useAllUsersQuery, useUserMutations } from "@/hooks/useUsers"
import { roleService } from "@/services/roleService"
import { USER_ROLE_LABELS } from "@/utils/constants"
import type { UserRole } from "@/types/user"

export default function AdminRoles() {
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.list(),
  })
  const { data: users, isLoading: usersLoading } = useAllUsersQuery()
  const { assignRole } = useUserMutations()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold">Rôles &amp; permissions</h1>
        <p className="text-sm text-muted-foreground">
          Consultez les permissions de chaque rôle et attribuez-les à vos utilisateurs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {rolesLoading || !roles
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)
          : roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <Badge className={`${role.color} w-fit`}>{role.label}</Badge>
                  <CardTitle className="text-base">{USER_ROLE_LABELS[role.id]}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {role.permissions.map((perm) => (
                      <li key={perm} className="flex items-center gap-2">
                        <span className="size-1 rounded-full bg-primary" /> {perm}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attribution des rôles</CardTitle>
          <CardDescription>Modifiez le rôle d'un utilisateur pour ajuster ses permissions.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0 px-4">
          {usersLoading || !users ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">{initials(user.firstName, user.lastName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Select
                  value={user.role}
                  onValueChange={(role) =>
                    assignRole.mutate(
                      { id: user.id, role: role as UserRole },
                      { onSuccess: () => toast.success(`Rôle mis à jour pour ${user.firstName}.`) }
                    )
                  }
                >
                  <SelectTrigger size="sm" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(USER_ROLE_LABELS) as UserRole[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {USER_ROLE_LABELS[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
