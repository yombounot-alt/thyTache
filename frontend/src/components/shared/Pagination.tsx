import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { PaginationMeta } from "@/types/api"

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.totalPages <= 1) return null

  const start = (meta.page - 1) * meta.pageSize + 1
  const end = Math.min(meta.page * meta.pageSize, meta.total)

  return (
    <div className="flex items-center justify-between border-t border-border px-1 pt-3">
      <p className="text-xs text-muted-foreground">
        {start}–{end} sur {meta.total}
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          aria-label="Page précédente"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <span className="px-2 text-xs text-muted-foreground">
          Page {meta.page} / {meta.totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Page suivante"
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
