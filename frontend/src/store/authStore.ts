import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { AuthSession, User } from "@/types/user"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setSession: (session: AuthSession) => void
  updateUser: (partial: Partial<User>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setSession: (session) => {
        localStorage.setItem("thytache-token", session.token)
        set({ user: session.user, token: session.token, isAuthenticated: true })
      },
      updateUser: (partial) =>
        set((state) => ({ user: state.user ? { ...state.user, ...partial } : state.user })),
      logout: () => {
        localStorage.removeItem("thytache-token")
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: "thytache-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
