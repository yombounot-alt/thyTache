import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ShieldAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Forbidden403() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"
      >
        <ShieldAlertIcon className="size-8" />
      </motion.div>
      <div className="space-y-2">
        <p className="font-brand text-6xl font-bold text-primary">403</p>
        <h1 className="text-xl font-semibold">Accès refusé</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
        </p>
      </div>
      <Button asChild>
        <Link to="/dashboard">Retour au tableau de bord</Link>
      </Button>
    </div>
  )
}
