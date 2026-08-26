import { useEffect } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { MailCheckIcon } from "lucide-react"
import { toast } from "sonner"

import { OtpForm } from "@/components/forms/OtpForm"
import { useAuth } from "@/hooks/useAuth"

interface LocationState {
  email: string
  purpose?: "register" | "login"
}

export default function VerifyOtp() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null
  const { verifyOtpMutation, sendOtpMutation } = useAuth()

  useEffect(() => {
    if (state?.email) sendOtpMutation.mutate(state.email)
  }, [])

  if (!state?.email) {
    return <Navigate to="/register" replace />
  }

  const handleVerify = (code: string) => {
    verifyOtpMutation.mutate(
      { email: state.email, code },
      {
        onSuccess: () => navigate("/account-verified"),
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Code invalide")
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <MailCheckIcon className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-brand text-2xl font-semibold">Vérification du code</h1>
          <p className="text-sm text-muted-foreground">
            Entrez le code à 6 chiffres envoyé à <span className="font-medium text-foreground">{state.email}</span>
          </p>
        </div>
      </div>
      <OtpForm
        onVerify={handleVerify}
        onResend={() => sendOtpMutation.mutate(state.email)}
        isVerifying={verifyOtpMutation.isPending}
        isResending={sendOtpMutation.isPending}
      />
    </div>
  )
}
