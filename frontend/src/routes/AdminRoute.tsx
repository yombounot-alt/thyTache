import { Navigate, Outlet } from "react-router-dom"

import { useAuthStore } from "@/store/authStore"

export function AdminRoute() {
  const user = useAuthStore((s) => s.user)

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
