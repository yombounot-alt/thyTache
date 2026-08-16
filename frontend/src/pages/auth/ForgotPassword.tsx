import { Link } from "react-router-dom"
import { KeyRoundIcon } from "lucide-react"

import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm"

export default function ForgotPassword() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
        <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <KeyRoundIcon className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-brand text-2xl font-semibold">Mot de passe oublié ?</h1>
          <p className="text-sm text-muted-foreground">
            Indiquez votre email, nous vous enverrons un code de vérification.
          </p>
        </div>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  )
}
