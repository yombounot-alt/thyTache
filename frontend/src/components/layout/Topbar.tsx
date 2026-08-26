import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MenuIcon, SearchIcon } from "lucide-react"

import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { UserMenu } from "@/components/layout/UserMenu"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { useUiStore } from "@/store/uiStore"

export function Topbar() {
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen)
  const navigate = useNavigate()
  const [search, setSearch] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <MenuIcon />
      </Button>

      <div className="hidden md:block">
        <Breadcrumb />
      </div>

      <form onSubmit={handleSearch} className="ml-auto hidden max-w-sm flex-1 sm:block">
        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une tâche..."
            className="pl-9"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-1.5 sm:ml-3">
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
