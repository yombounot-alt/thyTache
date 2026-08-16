export type NotificationType =
  | "task_created"
  | "task_updated"
  | "task_assigned"
  | "task_completed"
  | "otp_sent"
  | "email_sent"
  | "task_comment"
  | "task_overdue"

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}
