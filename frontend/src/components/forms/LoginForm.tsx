import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { EyeIcon, EyeOffIcon, LoaderCircleIcon, LogInIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { emailSchema } from "@/utils/validators"

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { loginMutation } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (values: LoginValues) => {
    loginMutation.mutate(values, {
      onSuccess: (session) => {
        toast.success(`Bon retour, ${session.user.firstName} !`)
        navigate("/dashboard")
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Échec de la connexion")
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <a href="/forgot-password" className="text-xs text-primary hover:underline">
            Mot de passe oublié ?
          </a>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <LogInIcon />
        )}
        Se connecter
      </Button>
    </form>
  )
}
