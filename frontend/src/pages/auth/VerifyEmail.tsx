import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { MailSearchIcon } from "lucide-react"

import { OtpForm } from "@/components/forms/OtpForm"
import { useAuth } from "@/hooks/useAuth"

interface LocationState {
  email: string
}

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null
  const { forgotPasswordMutation } = useAuth()

  if (!state?.email) {
    return <Navigate to="/forgot-password" replace />
  }

  // Le backend ne propose pas de vérification séparée du code : OTP et nouveau
  // mot de passe sont validés ensemble à l'étape suivante (/auth/reset-password).
  const handleVerify = (code: string) => {
    navigate("/reset-password", { state: { email: state.email, otp: code } })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <MailSearchIcon className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-brand text-2xl font-semibold">Vérifiez votre email</h1>
          <p className="text-sm text-muted-foreground">
            Entrez le code envoyé à <span className="font-medium text-foreground">{state.email}</span>
          </p>
        </div>
      </div>
      <OtpForm
        onVerify={handleVerify}
        onResend={() => forgotPasswordMutation.mutate(state.email)}
        isResending={forgotPasswordMutation.isPending}
      />
    </div>
  )
}
