import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { EyeIcon, EyeOffIcon, LoaderCircleIcon, UserPlusIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { emailSchema, passwordSchema } from "@/utils/validators"

const registerSchema = z
  .object({
    firstName: z.string().min(2, "2 caractères minimum"),
    lastName: z.string().min(2, "2 caractères minimum"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { registerMutation } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (values: RegisterValues) => {
    registerMutation.mutate(values, {
      onSuccess: ({ email, message }) => {
        toast.success(message)
        navigate("/verify-otp", { state: { email, purpose: "register" } })
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Échec de l'inscription")
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            aria-invalid={Boolean(errors.firstName)}
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            aria-invalid={Boolean(errors.lastName)}
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

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
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
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

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
        {registerMutation.isPending ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <UserPlusIcon />
        )}
        Créer mon compte
      </Button>
    </form>
  )
}
