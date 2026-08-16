import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { EyeIcon, EyeOffIcon, KeyRoundIcon, LoaderCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/authService"
import { passwordSchema } from "@/utils/validators"

const schema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

type Values = z.infer<typeof schema>

export function ChangePasswordForm({ email }: { email: string }) {
  const [show, setShow] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (values: Values) =>
      authService.changePassword(email, values.currentPassword, values.newPassword),
  })

  const onSubmit = (values: Values) => {
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success("Mot de passe modifié avec succès.")
        reset()
      },
      onError: (error) => {
        setError("currentPassword", { message: "Mot de passe incorrect" })
        toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={show ? "text" : "password"}
            aria-invalid={Boolean(errors.currentPassword)}
            {...register("currentPassword")}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
        <Input
          id="newPassword"
          type={show ? "text" : "password"}
          aria-invalid={Boolean(errors.newPassword)}
          {...register("newPassword")}
        />
        {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input
          id="confirmPassword"
          type={show ? "text" : "password"}
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? <LoaderCircleIcon className="animate-spin" /> : <KeyRoundIcon />}
        Mettre à jour le mot de passe
      </Button>
    </form>
  )
}
