import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  accentClassName?: string
  hint?: string
  delay?: number
}

export function StatCard({ label, value, icon: Icon, accentClassName, hint, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card className="gap-3 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className={cn("flex size-9 items-center justify-center rounded-lg", accentClassName)}>
            <Icon className="size-4.5" />
          </div>
        </div>
        <p className="font-brand text-3xl font-semibold">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </Card>
    </motion.div>
  )
}
