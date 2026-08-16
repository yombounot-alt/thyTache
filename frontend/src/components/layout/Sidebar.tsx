import { NavLink } from "react-router-dom"
import { ChevronsLeftIcon, ShieldIcon } from "lucide-react"

import logo from "@/assets/thy_logo.jpeg"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { useUiStore } from "@/store/uiStore"
import { APP_NAME } from "@/utils/constants"
import { workspaceNavSections, type NavSection } from "@/utils/navigation"

function NavSectionBlock({ section, collapsed }: { section: NavSection; collapsed: boolean }) {
  return (
    <div className="space-y-1">
      {section.title && !collapsed && (
        <p className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
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
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-2"
            )
          }
          title={collapsed ? item.label : undefined}
        >
          <item.icon className="size-4.5 shrink-0" />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </NavLink>
      ))}
    </div>
  )
}

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const user = useAuthStore((s) => s.user)

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 md:flex",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        <img src={logo} alt={APP_NAME} className="size-9 shrink-0 rounded-lg object-cover" />
        {!collapsed && <span className="font-brand text-lg font-semibold">{APP_NAME}</span>}
      </div>

      <nav className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {workspaceNavSections.map((section, i) => (
          <NavSectionBlock key={i} section={section} collapsed={collapsed} />
        ))}

        {user?.role === "admin" && (
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Administration
              </p>
            )}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-2"
                )
              }
              title={collapsed ? "Espace admin" : undefined}
            >
              <ShieldIcon className="size-4.5 shrink-0" />
              {!collapsed && <span className="truncate">Espace admin</span>}
            </NavLink>
          </div>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground cursor-pointer"
          aria-label={collapsed ? "Déplier la barre latérale" : "Réduire la barre latérale"}
        >
          <ChevronsLeftIcon className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Réduire</span>}
        </button>
      </div>
    </aside>
  )
}
