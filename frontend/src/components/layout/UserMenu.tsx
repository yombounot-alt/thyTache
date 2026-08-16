import { useNavigate } from "react-router-dom"
import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { initials } from "@/lib/format"
import { authService } from "@/services/authService"
import { useAuthStore } from "@/store/authStore"
import { USER_ROLE_LABELS } from "@/utils/constants"

export function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  if (!user) return null

  const handleLogout = () => {
    // Révoque le refresh token côté serveur (best-effort) ; la session locale
    // est nettoyée immédiatement sans attendre la réponse réseau.
    authService.logout().catch(() => {})
    logout()
    toast.success("Vous avez été déconnecté.")
    navigate("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar>
          <AvatarImage src={user.avatarUrl} alt={user.firstName} />
          <AvatarFallback>{initials(user.firstName, user.lastName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
          <span className="text-xs font-normal text-primary">{USER_ROLE_LABELS[user.role]}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <UserIcon /> Mon profil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/profile?tab=preferences")}>
          <SettingsIcon /> Préférences
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOutIcon /> Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
