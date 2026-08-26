import type { RoleDefinition } from "@/types/user"

// Les 3 rôles (admin/manager/member) sont fixés par le type `UserRole` et le
// schéma backend : ce ne sont pas des données modifiables, seulement du
// contenu de référence pour l'UI (libellé, description, permissions).
const ROLE_DEFINITIONS: RoleDefinition[] = [
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

export const roleService = {
  async list(): Promise<RoleDefinition[]> {
    return ROLE_DEFINITIONS
  },
}
