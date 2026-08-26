import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ResetSuccess() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="flex size-16 items-center justify-center rounded-2xl bg-success/15 text-success"
      >
        <CheckCircle2Icon className="size-8" />
      </motion.div>
      <div className="space-y-1.5">
        <h1 className="font-brand text-2xl font-semibold">Mot de passe réinitialisé</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.
        </p>
      </div>
      <Button className="w-full" asChild>
        <Link to="/login">
          Se connecter <ArrowRightIcon />
        </Link>
      </Button>
    </div>
  )
}
