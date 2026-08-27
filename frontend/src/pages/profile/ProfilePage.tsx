import { useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { CameraIcon, LoaderCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm"
import { ProfileForm } from "@/components/forms/ProfileForm"
import { initials } from "@/lib/format"
import { useUserMutations } from "@/hooks/useUsers"
import { useAuthStore } from "@/store/authStore"
import { useUiStore } from "@/store/uiStore"
import { USER_ROLE_LABELS } from "@/utils/constants"
import type { UserPreferences } from "@/types/user"

export default function ProfilePage() {
  const [searchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const updateAuthUser = useAuthStore((s) => s.updateUser)
  const { updateUser, uploadAvatar } = useUserMutations()
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) return null

  const defaultTab = searchParams.get("tab") === "preferences" ? "preferences" : "general"

  const handleAvatarPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format d'image non supporté (jpeg, png ou webp uniquement).")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image trop volumineuse (2 Mo maximum).")
      return
    }

    uploadAvatar.mutate(file, {
      onSuccess: (updated) => {
        updateAuthUser(updated)
        toast.success("Photo de profil mise à jour.")
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Échec de l'envoi de la photo de profil")
      },
    })
  }

  const handlePreferenceToggle = (key: keyof UserPreferences, value: boolean) => {
    const preferences = { ...user.preferences, [key]: value }
    updateUser.mutate(
      { id: user.id, patch: { preferences } },
      { onSuccess: (updated) => updateAuthUser(updated) }
    )
    if (key === "darkMode") {
      setTheme(value ? "dark" : "light")
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-brand text-2xl font-semibold">Profil</h1>
        <p className="text-sm text-muted-foreground">Gérez vos informations personnelles et vos préférences.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-2 sm:flex-row">
          <div className="relative">
            <Avatar className="size-20">
              <AvatarImage src={user.avatarUrl} alt={user.firstName} />
              <AvatarFallback className="text-xl">{initials(user.firstName, user.lastName)}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
              className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm cursor-pointer disabled:opacity-60"
              aria-label="Changer la photo de profil"
            >
              {uploadAvatar.isPending ? (
                <LoaderCircleIcon className="size-3.5 animate-spin" />
              ) : (
                <CameraIcon className="size-3.5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarPick}
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-xs font-medium text-primary">{USER_ROLE_LABELS[user.role]}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="general">Informations</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Ces informations sont visibles par votre équipe.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mot de passe</CardTitle>
              <CardDescription>Choisissez un mot de passe robuste et unique.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm email={user.email} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences</CardTitle>
              <CardDescription>Personnalisez votre expérience sur {`thyTache`}.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Mode sombre</p>
                  <p className="text-xs text-muted-foreground">Basculer entre le thème clair et sombre.</p>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={(v) => handlePreferenceToggle("darkMode", v)} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Notifications par email</p>
                  <p className="text-xs text-muted-foreground">Recevoir un résumé par email des activités importantes.</p>
                </div>
                <Switch
                  checked={user.preferences.emailNotifications}
                  onCheckedChange={(v) => handlePreferenceToggle("emailNotifications", v)}
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Notifications push</p>
                  <p className="text-xs text-muted-foreground">Recevoir des notifications en temps réel dans l'application.</p>
                </div>
                <Switch
                  checked={user.preferences.pushNotifications}
                  onCheckedChange={(v) => handlePreferenceToggle("pushNotifications", v)}
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Résumé hebdomadaire</p>
                  <p className="text-xs text-muted-foreground">Recevoir un récapitulatif de votre productivité chaque semaine.</p>
                </div>
                <Switch
                  checked={user.preferences.weeklyDigest}
                  onCheckedChange={(v) => handlePreferenceToggle("weeklyDigest", v)}
                />
              </div>
            </CardContent>
          </Card>
          <Separator className="my-4" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
