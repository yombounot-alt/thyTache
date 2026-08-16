import { db } from "@/mocks/db"
import { delay } from "@/services/mockClient"
import type { RoleDefinition } from "@/types/user"

export const roleService = {
  async list(): Promise<RoleDefinition[]> {
    await delay(150)
    return db.roles
  },
}
