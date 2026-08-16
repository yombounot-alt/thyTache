import type { RoleDefinition, User } from "@/types/user"

function defaultPreferences(darkMode = true) {
  return {
    darkMode,
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
  }
}

export const seedUsers: User[] = [
  {
    id: "u-admin",
    firstName: "Tamba Hallo",
    lastName: "Yombouno",
    email: "admin@thytache.com",
    phone: "+224 620 00 00 01",
    role: "admin",
    status: "active",
    createdAt: "2025-01-10T08:00:00.000Z",
    lastActiveAt: new Date().toISOString(),
    preferences: defaultPreferences(),
  },
  {
    id: "u-2",
    firstName: "Aïcha",
    lastName: "Diallo",
    email: "aicha.diallo@thytache.com",
    phone: "+224 620 00 00 02",
    role: "manager",
    status: "active",
    createdAt: "2025-02-03T08:00:00.000Z",
    lastActiveAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    preferences: defaultPreferences(),
  },
  {
    id: "u-3",
    firstName: "Mamadou",
    lastName: "Camara",
    email: "mamadou.camara@thytache.com",
    role: "member",
    status: "active",
    createdAt: "2025-02-15T08:00:00.000Z",
    lastActiveAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    preferences: defaultPreferences(false),
  },
  {
    id: "u-4",
    firstName: "Fatoumata",
    lastName: "Bah",
    email: "fatoumata.bah@thytache.com",
    role: "member",
    status: "active",
    createdAt: "2025-03-01T08:00:00.000Z",
    lastActiveAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString(),
    preferences: defaultPreferences(),
  },
  {
    id: "u-5",
    firstName: "Ibrahima",
    lastName: "Sylla",
    email: "ibrahima.sylla@thytache.com",
    role: "member",
    status: "inactive",
    createdAt: "2025-03-20T08:00:00.000Z",
    lastActiveAt: new Date(Date.now() - 20 * 24 * 3600_000).toISOString(),
    preferences: defaultPreferences(),
  },
  {
    id: "u-6",
    firstName: "Kadiatou",
    lastName: "Barry",
    email: "kadiatou.barry@thytache.com",
    role: "member",
    status: "active",
    createdAt: "2025-04-05T08:00:00.000Z",
    lastActiveAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    preferences: defaultPreferences(),
  },
]

export const seedPasswords: Record<string, string> = {
  "admin@thytache.com": "Admin1234",
  "aicha.diallo@thytache.com": "Password1",
  "mamadou.camara@thytache.com": "Password1",
}

export const roleDefinitions: RoleDefinition[] = [
  {
    id: "admin",
    label: "Administrateur",
    description: "Accès complet : utilisateurs, rôles, tâches, statistiques.",
    permissions: [
      "Gérer les utilisateurs",
      "Gérer les rôles",
      "Gérer toutes les tâches",
      "Voir les statistiques globales",
    ],
    color: "bg-primary/15 text-primary",
  },
  {
    id: "manager",
    label: "Manager",
    description: "Peut créer, assigner et suivre les tâches de son équipe.",
    permissions: ["Créer des tâches", "Assigner des tâches", "Voir les statistiques d'équipe"],
    color: "bg-chart-2/15 text-chart-2",
  },
  {
    id: "member",
    label: "Membre",
    description: "Peut gérer ses propres tâches assignées.",
    permissions: ["Gérer ses tâches", "Commenter", "Recevoir des notifications"],
    color: "bg-muted text-muted-foreground",
  },
]
