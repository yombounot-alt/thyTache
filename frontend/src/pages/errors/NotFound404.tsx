import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { CompassIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound404() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex size-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground"
      >
        <CompassIcon className="size-8" />
      </motion.div>
      <div className="space-y-2">
        <p className="font-brand text-6xl font-bold text-primary">404</p>
        <h1 className="text-xl font-semibold">Page introuvable</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </div>
  )
}
