import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRightIcon,
  BarChart3Icon,
  BellRingIcon,
  KanbanSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"

import logo from "@/assets/logo.jpeg"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/utils/constants"

const features = [
  {
    icon: KanbanSquareIcon,
    title: "4 vues pour vos tâches",
    description: "Liste, Kanban, Calendrier et Cartes : choisissez la vue qui correspond à votre façon de travailler.",
  },
  {
    icon: BarChart3Icon,
    title: "Statistiques en temps réel",
    description: "Suivez la progression de votre équipe grâce à des tableaux de bord clairs et détaillés.",
  },
  {
    icon: BellRingIcon,
    title: "Notifications intelligentes",
    description: "Restez informé de chaque changement : assignation, commentaire, échéance approchante.",
  },
  {
    icon: UsersIcon,
    title: "Gestion d'équipe complète",
    description: "Rôles, permissions et espace admin pour piloter toute votre organisation.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Sécurité renforcée",
    description: "Authentification à deux facteurs et récupération de compte sécurisée.",
  },
  {
    icon: SparklesIcon,
    title: "Expérience premium",
    description: "Une interface soignée, rapide et pensée pour le confort d'utilisation au quotidien.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt={APP_NAME} className="size-9 rounded-lg object-cover" />
            <span className="font-brand text-lg font-semibold">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link to="/register">
                Essayer gratuitement <ArrowRightIcon />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pt-20 pb-24 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(ellipse_at_top,theme(colors.primary/15),transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl space-y-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/50 px-3 py-1 text-xs font-medium text-accent-foreground">
            <SparklesIcon className="size-3.5" /> Nouveau : vue Kanban avec glisser-déposer
          </span>
          <h1 className="font-brand text-4xl leading-tight font-semibold text-balance sm:text-6xl">
            La gestion de tâches, <span className="text-primary">élevée au rang d'excellence.</span>
          </h1>
          <p className="mx-auto max-w-xl text-balance text-muted-foreground sm:text-lg">
            {APP_NAME} organise le travail de votre équipe avec la rigueur d'un outil professionnel
            et l'élégance d'un produit haut de gamme.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button size="lg" asChild>
              <Link to="/register">
                Créer un compte gratuit <ArrowRightIcon />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">J'ai déjà un compte</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mb-1.5 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-secondary/40 px-6 py-16 text-center">
        <div className="mx-auto max-w-xl space-y-4">
          <h2 className="font-brand text-2xl font-semibold sm:text-3xl">
            Prêt à transformer votre organisation ?
          </h2>
          <p className="text-muted-foreground">
            Rejoignez {APP_NAME} et pilotez vos projets avec clarté dès aujourd'hui.
          </p>
          <Button size="lg" asChild>
            <Link to="/register">
              Commencer maintenant <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME} — Tamba Hallo Yombouno. Tous droits réservés.
      </footer>
    </div>
  )
}
