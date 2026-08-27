import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

import logo from "@/assets/logo.jpeg"
import { useAuthStore } from "@/store/authStore"
import { APP_NAME } from "@/utils/constants"

export default function SplashScreen() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate(isAuthenticated ? "/dashboard" : "/accueil", { replace: true })
    }, 1400)
    return () => clearTimeout(timeout)
  }, [navigate, isAuthenticated])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#070b14] via-[#0d1420] to-[#141c2c]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="overflow-hidden rounded-3xl shadow-[0_0_60px_-10px] shadow-primary/40"
      >
        <img src={logo} alt={APP_NAME} className="size-36 object-cover" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="text-center"
      >
        <p className="font-brand text-2xl font-semibold tracking-wide text-foreground">
          {APP_NAME}
        </p>
        <p className="text-sm text-muted-foreground">Gestion de tâches, en toute élégance</p>
      </motion.div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 160 }}
        transition={{ delay: 0.4, duration: 0.9, ease: "easeInOut" }}
        className="h-0.5 overflow-hidden rounded-full bg-primary/70"
      />
    </div>
  )
}
