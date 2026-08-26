import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { LoaderCircleIcon, SaveIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUserMutations } from "@/hooks/useUsers"
import { useAuthStore } from "@/store/authStore"
import { emailSchema } from "@/utils/validators"
import type { User } from "@/types/user"

const schema = z.object({
  firstName: z.string().min(2, "2 caractères minimum"),
  lastName: z.string().min(2, "2 caractères minimum"),
  email: emailSchema,
  phone: z.string().optional(),
})

type Values = z.infer<typeof schema>

export function ProfileForm({ user }: { user: User }) {
  const updateAuthUser = useAuthStore((s) => s.updateUser)
  const { updateUser } = useUserMutations()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
    },
  })

  const onSubmit = (values: Values) => {
    updateUser.mutate(
      { id: user.id, patch: values },
      {
        onSuccess: (updated) => {
          updateAuthUser(updated)
          toast.success("Profil mis à jour avec succès.")
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">Prénom</Label>
          <Input id="firstName" aria-invalid={Boolean(errors.firstName)} {...register("firstName")} />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Nom</Label>
          <Input id="lastName" aria-invalid={Boolean(errors.lastName)} {...register("lastName")} />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Téléphone</Label>
        <Input id="phone" placeholder="+224 620 00 00 00" {...register("phone")} />
      </div>
      <Button type="submit" disabled={!isDirty || updateUser.isPending}>
        {updateUser.isPending ? <LoaderCircleIcon className="animate-spin" /> : <SaveIcon />}
        Enregistrer les modifications
      </Button>
    </form>
  )
}
