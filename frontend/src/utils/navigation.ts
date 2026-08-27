import {
  BarChart3Icon,
  CalendarDaysIcon,
  KanbanSquareIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  ListTodoIcon,
  MailIcon,
  ShieldIcon,
  Trash2Icon,
  UserCogIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  end?: boolean
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export const workspaceNavSections: NavSection[] = [
  {
    items: [{ label: "Tableau de bord", path: "/dashboard", icon: LayoutDashboardIcon, end: true }],
  },
  {
    title: "Tâches",
    items: [
      { label: "Vue Liste", path: "/tasks", icon: ListTodoIcon, end: true },
      { label: "Vue Kanban", path: "/tasks/kanban", icon: KanbanSquareIcon },
      { label: "Vue Calendrier", path: "/tasks/calendar", icon: CalendarDaysIcon },
      { label: "Vue Cartes", path: "/tasks/cards", icon: LayoutGridIcon },
      { label: "Corbeille", path: "/tasks/trash", icon: Trash2Icon },
    ],
  },
  {
    title: "Espace",
    items: [
      { label: "Profil", path: "/profile", icon: UserIcon },
      { label: "Aperçus d'emails", path: "/emails-preview", icon: MailIcon },
    ],
  },
]

export const adminNavSections: NavSection[] = [
  {
    title: "Administration",
    items: [
      { label: "Tableau de bord", path: "/admin", icon: LayoutDashboardIcon, end: true },
      { label: "Utilisateurs", path: "/admin/users", icon: UsersIcon },
      { label: "Rôles", path: "/admin/roles", icon: ShieldIcon },
      { label: "Toutes les tâches", path: "/admin/tasks", icon: UserCogIcon },
      { label: "Statistiques", path: "/admin/statistics", icon: BarChart3Icon },
    ],
  },
]
