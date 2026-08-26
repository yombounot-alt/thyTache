import { useState } from "react"
import {
  BellRingIcon,
  KeyRoundIcon,
  MailCheckIcon,
  PartyPopperIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  type LucideIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { EmailButton, EmailHeading, EmailShell } from "@/components/shared/EmailShell"
import { MailClientFrame } from "@/components/shared/MailClientFrame"
import { APP_NAME } from "@/utils/constants"

interface EmailTemplate {
  id: string
  label: string
  icon: LucideIcon
  subject: string
  to: string
  content: React.ReactNode
}

const templates: EmailTemplate[] = [
  {
    id: "welcome",
    label: "Bienvenue",
    icon: PartyPopperIcon,
    subject: `Bienvenue sur ${APP_NAME} !`,
    to: "aicha.diallo@thytache.com",
    content: (
      <>
        <EmailHeading>Bienvenue, Aïcha 👋</EmailHeading>
        <p>Votre compte {APP_NAME} a été créé avec succès. Vous pouvez dès maintenant organiser vos tâches et collaborer avec votre équipe.</p>
        <EmailButton>Accéder à mon espace</EmailButton>
        <p className="text-xs text-[#8a93a3]">Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>
      </>
    ),
  },
  {
    id: "otp",
    label: "Code OTP",
    icon: ShieldCheckIcon,
    subject: "Votre code de vérification",
    to: "admin@thytache.com",
    content: (
      <>
        <EmailHeading>Code de vérification</EmailHeading>
        <p>Utilisez le code ci-dessous pour vérifier votre identité. Ce code expire dans 10 minutes.</p>
        <p className="py-3 text-center text-3xl font-bold tracking-[0.4em] text-[#0d1420]">123 456</p>
        <p className="text-xs text-[#8a93a3]">Ne partagez jamais ce code, même avec le support {APP_NAME}.</p>
      </>
    ),
  },
  {
    id: "forgot-password",
    label: "Mot de passe oublié",
    icon: KeyRoundIcon,
    subject: "Réinitialisation de votre mot de passe",
    to: "mamadou.camara@thytache.com",
    content: (
      <>
        <EmailHeading>Réinitialisez votre mot de passe</EmailHeading>
        <p>Nous avons reçu une demande de réinitialisation de mot de passe. Utilisez le code suivant pour continuer :</p>
        <p className="py-3 text-center text-3xl font-bold tracking-[0.4em] text-[#0d1420]">123 456</p>
        <p className="text-xs text-[#8a93a3]">Si vous n'êtes pas à l'origine de cette demande, sécurisez votre compte immédiatement.</p>
      </>
    ),
  },
  {
    id: "new-task",
    label: "Nouvelle tâche",
    icon: MailCheckIcon,
    subject: "Une nouvelle tâche a été créée",
    to: "fatoumata.bah@thytache.com",
    content: (
      <>
        <EmailHeading>Nouvelle tâche créée</EmailHeading>
        <p>
          « Créer les templates d'emails transactionnels » vient d'être ajoutée au tableau de l'équipe Design.
        </p>
        <EmailButton>Voir la tâche</EmailButton>
      </>
    ),
  },
  {
    id: "task-assigned",
    label: "Tâche affectée",
    icon: UserPlusIcon,
    subject: "Une tâche vous a été assignée",
    to: "kadiatou.barry@thytache.com",
    content: (
      <>
        <EmailHeading>Tâche assignée</EmailHeading>
        <p>
          Tamba Hallo Yombouno vous a assigné la tâche « Corriger le bug d'affichage sur mobile », à
          traiter avant demain.
        </p>
        <EmailButton>Consulter la tâche</EmailButton>
      </>
    ),
  },
  {
    id: "task-reminder",
    label: "Rappel de tâche",
    icon: BellRingIcon,
    subject: "Rappel : échéance à venir",
    to: "ibrahima.sylla@thytache.com",
    content: (
      <>
        <EmailHeading>N'oubliez pas votre échéance</EmailHeading>
        <p>
          La tâche « Migration de la base de données de test » arrive à échéance demain. Pensez à
          mettre à jour son avancement.
        </p>
        <EmailButton>Mettre à jour la tâche</EmailButton>
      </>
    ),
  },
]

export default function EmailsPreviewGallery() {
  const [activeId, setActiveId] = useState(templates[0].id)
  const active = templates.find((t) => t.id === activeId) ?? templates[0]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-brand text-2xl font-semibold">Aperçus d'emails</h1>
        <p className="text-sm text-muted-foreground">
          Maquettes des emails transactionnels envoyés par {APP_NAME} (aucun envoi réel).
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit py-2">
          <CardContent className="space-y-1 px-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setActiveId(template.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer",
                  activeId === template.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <template.icon className="size-4 shrink-0" />
                {template.label}
              </button>
            ))}
          </CardContent>
        </Card>

        <MailClientFrame from={`notifications@thytache.com`} to={active.to} subject={active.subject}>
          <EmailShell preheader={active.subject}>{active.content}</EmailShell>
        </MailClientFrame>
      </div>
    </div>
  )
}
