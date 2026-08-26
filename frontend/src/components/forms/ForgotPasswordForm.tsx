import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { LoaderCircleIcon, SendIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { emailSchema } from "@/utils/validators"

const schema = z.object({ email: emailSchema })
type Values = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const navigate = useNavigate()
  const { forgotPasswordMutation } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  const onSubmit = (values: Values) => {
    forgotPasswordMutation.mutate(values.email, {
      onSuccess: ({ message }) => {
        toast.success(message)
        navigate("/verify-email", { state: { email: values.email } })
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
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

      <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
        {forgotPasswordMutation.isPending ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <SendIcon />
        )}
        Envoyer le code
      </Button>
    </form>
  )
}
