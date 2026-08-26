import { useMutation } from "@tanstack/react-query"

import { authService } from "@/services/authService"
import { useAuthStore } from "@/store/authStore"

export function useAuth() {
  const { user, token, isAuthenticated, setSession, logout } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (session) => setSession(session),
  })

  const registerMutation = useMutation({
    mutationFn: authService.register,
  })

  const sendOtpMutation = useMutation({
    mutationFn: (email: string) => authService.sendOtp(email),
  })

  // Le backend valide uniquement l'OTP ici (aucune session n'est ouverte) :
  // l'utilisateur doit ensuite se connecter explicitement via /login.
  const verifyOtpMutation = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authService.verifyOtp(email, code),
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) =>
      authService.resetPassword(email, otp, newPassword),
  })

  return {
    user,
    token,
    isAuthenticated,
    logout,
    loginMutation,
    registerMutation,
    sendOtpMutation,
    verifyOtpMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
  }
}
