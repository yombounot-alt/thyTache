import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { LoaderCircleIcon, ShieldCheckIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useCountdown } from "@/hooks/useCountdown"
import { otpSchema } from "@/utils/validators"

const otpFormSchema = z.object({ code: otpSchema })
type OtpValues = z.infer<typeof otpFormSchema>

interface OtpFormProps {
  onVerify: (code: string) => void
  onResend: () => void
  isVerifying?: boolean
  isResending?: boolean
}

export function OtpForm({ onVerify, onResend, isVerifying, isResending }: OtpFormProps) {
  const { seconds, isActive, reset } = useCountdown(60)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { code: "" },
  })

  const handleResend = () => {
    onResend()
    reset(60)
    toast.info("Un nouveau code a été envoyé.")
  }

  return (
    <form onSubmit={handleSubmit((v) => onVerify(v.code))} className="space-y-5" noValidate>
      <div className="flex justify-center">
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          )}
        />
      </div>
      {errors.code && (
        <p className="text-center text-xs text-destructive">{errors.code.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={isVerifying}>
        {isVerifying ? <LoaderCircleIcon className="animate-spin" /> : <ShieldCheckIcon />}
        Vérifier le code
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isActive ? (
          <>Renvoyer le code dans {seconds}s</>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-medium text-primary hover:underline disabled:opacity-50 cursor-pointer"
          >
            Renvoyer le code
          </button>
        )}
      </p>
    </form>
  )
}
