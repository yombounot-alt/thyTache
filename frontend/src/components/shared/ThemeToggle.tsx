import { MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useUiStore } from "@/store/uiStore"

export function ThemeToggle() {
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
