import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRightIcon, PartyPopperIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function AccountVerified() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="flex size-16 items-center justify-center rounded-2xl bg-success/15 text-success"
      >
        <PartyPopperIcon className="size-8" />
      </motion.div>
      <div className="space-y-1.5">
        <h1 className="font-brand text-2xl font-semibold">Compte vérifié !</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Votre adresse email a été confirmée avec succès. Vous pouvez maintenant vous connecter.
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
