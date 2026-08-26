import { Navigate, useLocation } from "react-router-dom"
import { LockKeyholeIcon } from "lucide-react"

import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm"

interface LocationState {
  email: string
  otp: string
}

export default function ResetPassword() {
  const location = useLocation()
  const state = location.state as LocationState | null

  if (!state?.email || !state?.otp) {
    return <Navigate to="/forgot-password" replace />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <LockKeyholeIcon className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-brand text-2xl font-semibold">Nouveau mot de passe</h1>
          <p className="text-sm text-muted-foreground">Choisissez un nouveau mot de passe sécurisé.</p>
        </div>
      </div>
      <ResetPasswordForm email={state.email} otp={state.otp} />
    </div>
  )
}
