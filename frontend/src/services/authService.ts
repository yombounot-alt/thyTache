import { isAxiosError } from "axios"

import { api } from "@/lib/axios"
import { toApiError } from "@/lib/apiError"
import { mapBackendUser } from "@/lib/mapBackendUser"
import type { AuthSession, User } from "@/types/user"

interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  password: string
}

export { ApiError } from "@/lib/apiError"

export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    try {
      const { data } = await api.post("/auth/login", { email, password })
      return { user: mapBackendUser(data.data.user), token: data.data.accessToken }
    } catch (error) {
      throw toApiError(error, "Échec de la connexion")
    }
  },

  async register(input: RegisterInput): Promise<{ email: string; message: string }> {
    try {
      const { data } = await api.post("/auth/register", {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        password: input.password,
      })
      return { email: input.email, message: data.message }
    } catch (error) {
      throw toApiError(error, "Échec de l'inscription")
    }
  },

  async sendOtp(email: string): Promise<void> {
    try {
      await api.post("/auth/resend-otp", { email })
    } catch (error) {
      // Le backend répond 400 si un code est déjà actif (anti-abus) : un code
      // valide vient déjà d'être émis (par register ou un appel précédent),
      // on l'ignore silencieusement pour rester compatible avec les appels
      // "best effort" existants (ex: envoi automatique à l'arrivée sur la page OTP).
      if (isAxiosError(error) && error.response?.status === 400) return
      throw toApiError(error, "Échec de l'envoi du code")
    }
  },

  // Alias explicite demandé par la nomenclature du service ; comportement identique à sendOtp.
  resendOtp(email: string): Promise<void> {
    return authService.sendOtp(email)
  },

  async verifyOtp(email: string, code: string): Promise<{ message: string }> {
    try {
      const { data } = await api.post("/auth/verify-email", { email, otp: code })
      return { message: data.message }
    } catch (error) {
      throw toApiError(error, "Code de vérification incorrect")
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const { data } = await api.post("/auth/forgot-password", { email })
      return { message: data.message }
    } catch (error) {
      throw toApiError(error, "Une erreur est survenue")
    }
  },

  // Le backend valide OTP + nouveau mot de passe en une seule requête (pas de
  // vérification préalable séparée) : `otp` est donc requis ici.
  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    try {
      await api.post("/auth/reset-password", { email, otp, newPassword })
    } catch (error) {
      throw toApiError(error, "Échec de la réinitialisation du mot de passe")
    }
  },

  // `email` n'est pas utilisé par le backend (l'utilisateur est identifié via
  // le token JWT) mais reste dans la signature pour ne pas modifier l'appelant.
  async changePassword(_email: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.patch("/auth/change-password", { currentPassword, newPassword })
    } catch (error) {
      throw toApiError(error, "Échec du changement de mot de passe")
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const { data } = await api.get("/auth/me")
      return mapBackendUser(data.data)
    } catch (error) {
      throw toApiError(error, "Session expirée")
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout")
    } catch {
      // La déconnexion locale (store) doit réussir même si l'appel réseau échoue.
    }
  },
}
