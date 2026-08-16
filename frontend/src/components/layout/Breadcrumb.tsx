import { Link, useLocation } from "react-router-dom"
import { ChevronRightIcon, HomeIcon } from "lucide-react"

const PATH_LABELS: Record<string, string> = {
  dashboard: "Tableau de bord",
  tasks: "Tâches",
  kanban: "Kanban",
  calendar: "Calendrier",
  cards: "Cartes",
  profile: "Profil",
  "emails-preview": "Aperçus d'emails",
  notifications: "Notifications",
  admin: "Administration",
  users: "Utilisateurs",
  roles: "Rôles",
  statistics: "Statistiques",
}

export function Breadcrumb() {
  const { pathname } = useLocation()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0 || segments[0] === "dashboard") {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <HomeIcon className="size-3.5" />
        <span className="font-medium text-foreground">Tableau de bord</span>
      </div>
    )
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Fil d'ariane">
      <Link to="/dashboard" className="flex items-center hover:text-foreground">
        <HomeIcon className="size-3.5" />
      </Link>
      {segments.map((segment, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/")
        const isLast = index === segments.length - 1
        const label = PATH_LABELS[segment] ?? segment

        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRightIcon className="size-3.5" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link to={path} className="hover:text-foreground">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
