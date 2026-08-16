import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { LoaderCircleIcon, SaveIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { USER_ROLE_LABELS } from "@/utils/constants"
import { emailSchema } from "@/utils/validators"
import type { UserRole } from "@/types/user"

const schema = z.object({
  firstName: z.string().min(2, "2 caractères minimum"),
  lastName: z.string().min(2, "2 caractères minimum"),
  email: emailSchema,
  role: z.enum(["admin", "manager", "member"]),
})

export type UserFormValues = z.infer<typeof schema>

interface UserFormProps {
  defaultValues?: Partial<UserFormValues>
  onSubmit: (values: UserFormValues) => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function UserForm({ defaultValues, onSubmit, isSubmitting, submitLabel = "Créer l'utilisateur" }: UserFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", role: "member", ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
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
        <Label>Rôle</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(USER_ROLE_LABELS) as UserRole[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {USER_ROLE_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : <SaveIcon />}
        {submitLabel}
      </Button>
    </form>
  )
}
