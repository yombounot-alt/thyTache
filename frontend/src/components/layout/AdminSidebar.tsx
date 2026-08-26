import { NavLink } from "react-router-dom"
import { ArrowLeftIcon } from "lucide-react"

import logo from "@/assets/thy_logo.jpeg"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/utils/constants"
import { adminNavSections } from "@/utils/navigation"

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        <img src={logo} alt={APP_NAME} className="size-9 shrink-0 rounded-lg object-cover" />
        <div>
          <p className="font-brand text-sm leading-tight font-semibold">{APP_NAME}</p>
          <p className="text-[11px] leading-tight text-muted-foreground">Espace admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {adminNavSections.map((section, i) => (
          <div key={i} className="space-y-1">
            {section.title && (
              <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {section.title}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <item.icon className="size-4.5 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        >
          <ArrowLeftIcon className="size-4.5" /> Retour à l'espace
        </NavLink>
      </div>
    </aside>
  )
}
