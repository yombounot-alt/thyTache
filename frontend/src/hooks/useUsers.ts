import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { userService, type UserQueryParams } from "@/services/userService"
import type { User, UserRole } from "@/types/user"

export const usersKey = (params?: UserQueryParams) => ["users", params] as const
export const allUsersKey = ["users", "all"] as const

export function useUsersQuery(params: UserQueryParams = {}) {
  return useQuery({
    queryKey: usersKey(params),
    queryFn: () => userService.list(params),
  })
}

export function useAllUsersQuery() {
  return useQuery({
    queryKey: allUsersKey,
    queryFn: () => userService.listAll(),
  })
}

export function useUserMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users"] })

  const createUser = useMutation({ mutationFn: userService.create, onSuccess: invalidate })

  const updateUser = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<User> }) =>
      userService.update(id, patch),
    onSuccess: invalidate,
  })

  const deleteUser = useMutation({ mutationFn: userService.remove, onSuccess: invalidate })

  const toggleStatus = useMutation({ mutationFn: userService.toggleStatus, onSuccess: invalidate })

  const resetPassword = useMutation({ mutationFn: userService.resetPassword })

  const assignRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => userService.assignRole(id, role),
    onSuccess: invalidate,
  })

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: invalidate,
  })

  return { createUser, updateUser, deleteUser, toggleStatus, resetPassword, assignRole, uploadAvatar }
}
