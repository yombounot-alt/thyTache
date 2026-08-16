import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ServerCrashIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ServerError500() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex size-16 items-center justify-center rounded-2xl bg-warning/10 text-warning"
      >
        <ServerCrashIcon className="size-8" />
      </motion.div>
      <div className="space-y-2">
        <p className="font-brand text-6xl font-bold text-primary">500</p>
        <h1 className="text-xl font-semibold">Erreur serveur</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Une erreur inattendue s'est produite. Merci de réessayer dans quelques instants.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </div>
  )
}
