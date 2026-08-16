import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  MailIcon,
  MessageSquareIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { formatRelative } from "@/lib/format"
import type { AppNotification, NotificationType } from "@/types/notification"

const ICONS: Record<NotificationType, LucideIcon> = {
  task_created: PlusCircleIcon,
  task_updated: MessageSquareIcon,
  task_assigned: UserPlusIcon,
  task_completed: CheckCircle2Icon,
  otp_sent: ShieldCheckIcon,
  email_sent: MailIcon,
  task_comment: MessageSquareIcon,
  task_overdue: AlertTriangleIcon,
}

const COLORS: Record<NotificationType, string> = {
  task_created: "bg-chart-2/15 text-chart-2",
  task_updated: "bg-chart-5/15 text-chart-5",
  task_assigned: "bg-primary/15 text-primary",
  task_completed: "bg-success/15 text-success",
  otp_sent: "bg-accent text-accent-foreground",
  email_sent: "bg-accent text-accent-foreground",
  task_comment: "bg-chart-5/15 text-chart-5",
  task_overdue: "bg-destructive/15 text-destructive",
}

interface NotificationItemProps {
  notification: AppNotification
  onMarkAsRead?: () => void
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const Icon = ICONS[notification.type]

  return (
    <button
      type="button"
      onClick={onMarkAsRead}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40 cursor-pointer",
        !notification.read && "bg-accent/20"
      )}
    >
      <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", COLORS[notification.type])}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{notification.title}</p>
          {!notification.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
        <p className="text-[11px] text-muted-foreground/70">{formatRelative(notification.createdAt)}</p>
      </div>
    </button>
  )
}
