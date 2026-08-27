import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle2Icon, ShieldCheckIcon, SparklesIcon } from "lucide-react"

import logo from "@/assets/logo.jpeg"
import { APP_NAME } from "@/utils/constants"

const highlights = [
  {
    icon: SparklesIcon,
    title: "Organisez tout, sans effort",
    description: "Vues Liste, Kanban, Calendrier et Cartes pour piloter vos tâches comme vous l'entendez.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Sécurisé et fiable",
    description: "Authentification à deux facteurs et gestion fine des rôles pour toute votre équipe.",
  },
  {
    icon: CheckCircle2Icon,
    title: "Pensé pour la productivité",
    description: "Statistiques en temps réel pour suivre la progression de chaque projet.",
  },
]

export function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#070b14] via-[#0d1420] to-[#141c2c] p-10 text-foreground lg:flex">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 size-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <img src={logo} alt={APP_NAME} className="size-11 rounded-lg object-cover" />
          <span className="font-brand text-xl font-semibold tracking-wide">{APP_NAME}</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative space-y-8"
        >
          <h1 className="font-brand text-4xl leading-tight font-semibold text-balance">
            La gestion de tâches, élevée au rang d'excellence.
          </h1>
          <div className="space-y-5">
            {highlights.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-primary">
                  <item.icon className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME} — Tamba Hallo Yombouno
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
