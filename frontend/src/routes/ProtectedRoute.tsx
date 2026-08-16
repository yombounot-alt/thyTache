import { useEffect, useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import { PageLoader } from "@/components/shared/PageLoader"
import { authService } from "@/services/authService"
import { useAuthStore } from "@/store/authStore"

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const updateUser = useAuthStore((s) => s.updateUser)
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()
  // Si déjà déconnecté, rien à vérifier : on redirige directement sans passer par le loader.
  const [checked, setChecked] = useState(!isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false
    // Valide la session auprès du backend (token peut avoir expiré/être révoqué
    // depuis un autre onglet). Passe par l'intercepteur axios, qui tentera un
    // refresh automatique en cas de 401 avant d'échouer définitivement.
    authService
      .getCurrentUser()
      .then((freshUser) => {
        if (!cancelled) updateUser(freshUser)
      })
      .catch(() => {
        if (!cancelled) logout()
      })
      .finally(() => {
        if (!cancelled) setChecked(true)
      })

    return () => {
      cancelled = true
    }
    // Vérification unique à l'entrée dans la zone protégée, pas à chaque changement de route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!checked) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
