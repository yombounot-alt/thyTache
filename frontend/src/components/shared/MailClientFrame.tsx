interface MailClientFrameProps {
  from: string
  to: string
  subject: string
  children: React.ReactNode
}

export function MailClientFrame({ from, to, subject, children }: MailClientFrameProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="space-y-1.5 border-b border-border bg-muted/30 px-5 py-4 text-sm">
        <p className="font-semibold">{subject}</p>
        <p className="text-xs text-muted-foreground">
          De : <span className="text-foreground">{from}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          À : <span className="text-foreground">{to}</span>
        </p>
      </div>
      <div className="bg-[#eef0f3] p-6 sm:p-10">{children}</div>
    </div>
  )
}
