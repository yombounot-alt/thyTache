import { format, formatDistanceToNow, isPast, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

export function formatDate(iso: string | null | undefined, pattern = "d MMM yyyy") {
  if (!iso) return "—"
  return format(parseISO(iso), pattern, { locale: fr })
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—"
  return format(parseISO(iso), "d MMM yyyy 'à' HH:mm", { locale: fr })
}

export function formatRelative(iso: string | null | undefined) {
  if (!iso) return "—"
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: fr })
}

export function isOverdue(iso: string | null | undefined) {
  if (!iso) return false
  return isPast(parseISO(iso))
}

export function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function formatFileSize(sizeKb: number) {
  if (sizeKb < 1024) return `${sizeKb} Ko`
  return `${(sizeKb / 1024).toFixed(1)} Mo`
}
