import { NavLink } from "react-router-dom"
import { ShieldIcon } from "lucide-react"

import logo from "@/assets/logo.jpeg"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { useUiStore } from "@/store/uiStore"
import { APP_NAME } from "@/utils/constants"
import { workspaceNavSections } from "@/utils/navigation"

export function MobileNav() {
  const open = useUiStore((s) => s.mobileNavOpen)
  const setOpen = useUiStore((s) => s.setMobileNavOpen)
  const user = useAuthStore((s) => s.user)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-72">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-2.5 font-brand text-lg">
            <img src={logo} alt={APP_NAME} className="size-9 shrink-0 rounded-lg object-cover" />
            {APP_NAME}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {workspaceNavSections.map((section, i) => (
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
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground/70 hover:bg-accent/60 hover:text-accent-foreground"
                    )
                  }
                >
                  <item.icon className="size-4.5 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}

          {user?.role === "admin" && (
            <div className="space-y-1">
              <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Administration
              </p>
              <NavLink
                to="/admin"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/70 hover:bg-accent/60 hover:text-accent-foreground"
                  )
                }
              >
                <ShieldIcon className="size-4.5 shrink-0" />
                Espace admin
              </NavLink>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
