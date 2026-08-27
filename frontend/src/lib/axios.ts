import axios from "axios"
import type { InternalAxiosRequestConfig } from "axios"

import { useAuthStore } from "@/store/authStore"

/**
 * Instance Axios branchée sur le backend Express (Point 3 - authentification).
 * `withCredentials: true` est nécessaire pour que le cookie httpOnly contenant
 * le refresh token (posé par le backend sur /auth/login et /auth/refresh-token)
 * soit envoyé automatiquement par le navigateur.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1"

// Origine seule (sans /api/v1), pour résoudre les chemins relatifs renvoyés
// par le backend (ex: avatarUrl = "/uploads/avatars/xxx.jpg") en URL absolue
// affichable — le backend et le frontend ne partagent pas la même origine en dev.
export const API_ORIGIN = new URL(API_BASE_URL).origin

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("thytache-token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Un seul refresh en vol à la fois : les requêtes concurrentes qui échouent en
// 401 pendant qu'un refresh est déjà en cours attendent la même promesse
// plutôt que de déclencher chacune leur propre appel /auth/refresh-token.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  // Appel via `axios` brut (pas `api`) pour ne pas repasser par l'intercepteur
  // de réponse ci-dessous et provoquer une boucle en cas d'échec.
  const response = await axios.post<{ data: { accessToken: string } }>(
    `${api.defaults.baseURL}/auth/refresh-token`,
    {},
    { withCredentials: true }
  )
  const newToken = response.data.data.accessToken
  localStorage.setItem("thytache-token", newToken)
  useAuthStore.setState({ token: newToken })
  return newToken
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const status = error.response?.status
    const url = originalRequest?.url ?? ""
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh-token")

    if (status !== 401 || !originalRequest || isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }
      const newToken = await refreshPromise
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api(originalRequest)
    } catch (refreshError) {
      // Refresh token absent, expiré ou révoqué : session définitivement terminée.
      useAuthStore.getState().logout()
      return Promise.reject(refreshError)
    }
  }
)
