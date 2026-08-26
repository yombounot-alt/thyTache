import { Toaster as Sonner, type ToasterProps } from "sonner"

import { useUiStore } from "@/store/uiStore"

function Toaster(props: ToasterProps) {
  const theme = useUiStore((state) => state.theme)

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      richColors
      position="top-right"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
