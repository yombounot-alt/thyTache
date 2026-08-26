import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { TaskViewMode } from "@/types/task"

export type Theme = "dark" | "light"

function applyThemeToDocument(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
  localStorage.setItem("thytache-theme", theme)
}

interface UiState {
  theme: Theme
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  taskViewMode: TaskViewMode
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  toggleSidebar: () => void
  setMobileNavOpen: (open: boolean) => void
  setTaskViewMode: (mode: TaskViewMode) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      sidebarCollapsed: false,
      mobileNavOpen: false,
      taskViewMode: "list",
      setTheme: (theme) => {
        applyThemeToDocument(theme)
        set({ theme })
      },
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark"
        applyThemeToDocument(next)
        set({ theme: next })
      },
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
      setTaskViewMode: (mode) => set({ taskViewMode: mode }),
    }),
    {
      name: "thytache-ui",
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        taskViewMode: state.taskViewMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeToDocument(state.theme)
      },
    }
  )
)
