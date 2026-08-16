import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { EyeIcon, EyeOffIcon, KeyRoundIcon, LoaderCircleIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { passwordSchema } from "@/utils/validators"

const schema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

type Values = z.infer<typeof schema>

export function ResetPasswordForm({ email, otp }: { email: string; otp: string }) {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { resetPasswordMutation } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  const onSubmit = (values: Values) => {
    resetPasswordMutation.mutate(
      { email, otp, newPassword: values.password },
      {
        onSuccess: () => navigate("/reset-success"),
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="password">Nouveau mot de passe</Label>
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

      <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
        {resetPasswordMutation.isPending ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <KeyRoundIcon />
        )}
        Réinitialiser le mot de passe
      </Button>
    </form>
  )
}
