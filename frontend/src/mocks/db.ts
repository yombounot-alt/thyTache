import { seedNotifications } from "./data/notifications"
import { seedTasks } from "./data/tasks"
import { roleDefinitions, seedPasswords, seedUsers } from "./data/users"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

/**
 * "Base de données" en mémoire simulant ce que servira le futur backend
 * Express. Les services lisent/écrivent ici pour que les mutations
 * (créer/éditer/supprimer) persistent le temps de la session.
 */
export const db = {
  users: clone(seedUsers),
  passwords: clone(seedPasswords) as Record<string, string>,
  roles: clone(roleDefinitions),
  tasks: clone(seedTasks),
  notifications: clone(seedNotifications),
}

export const DEMO_OTP_CODE = "123456"
