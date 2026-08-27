import { useRef, useState } from "react"
import { toast } from "sonner"
import {
  CalendarIcon,
  CheckCircle2Icon,
  PaperclipIcon,
  PencilIcon,
  SendIcon,
  Trash2Icon,
  UploadIcon,
  UserIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal"
import { TaskFormModal } from "@/components/modals/TaskFormModal"
import { formatDate, formatDateTime, formatFileSize, formatRelative, initials, isOverdue } from "@/lib/format"
import { useAllUsersQuery } from "@/hooks/useUsers"
import { useTaskMutations, useTaskQuery } from "@/hooks/useTasks"
import { useAuthStore } from "@/store/authStore"
import {
  TASK_PRIORITY_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  TASK_CATEGORY_LABELS,
} from "@/utils/constants"
import type { TaskStatus } from "@/types/task"

interface TaskDetailModalProps {
  taskId: string | null
  onOpenChange: (open: boolean) => void
}

export function TaskDetailModal({ taskId, onOpenChange }: TaskDetailModalProps) {
  const { data: task } = useTaskQuery(taskId ?? undefined)
  const { data: users } = useAllUsersQuery()
  const { updateTask, addComment, addAttachment, deleteTask } = useTaskMutations()
  const user = useAuthStore((s) => s.user)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [comment, setComment] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!task || !user) return null

  const usersById = new Map((users ?? []).map((u) => [u.id, u]))
  const assignee = task.assigneeId ? usersById.get(task.assigneeId) : undefined
  const creator = usersById.get(task.creatorId)
  const overdue = task.status !== "done" && isOverdue(task.dueDate)

  // Un admin peut désormais consulter n'importe quelle tâche (RBAC), mais le
  // backend ne lui accorde pas de passe-droit en écriture pour autant : ces
  // actions restent réservées au créateur/assigné, exactement comme pour un
  // utilisateur standard (cf. task.service.findAccessibleTask côté backend).
  const canModify = task.creatorId === user.id || task.assigneeId === user.id
  const canDelete = task.creatorId === user.id

  const handleStatusChange = (status: TaskStatus) => {
    updateTask.mutate(
      { id: task.id, patch: { status }, actorId: user.id },
      {
        onSuccess: () => {
          toast.success("Statut mis à jour.")
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Échec de la mise à jour du statut")
        },
      }
    )
  }

  const handleAddComment = () => {
    if (!comment.trim()) return
    addComment.mutate(
      { taskId: task.id, authorId: user.id, content: comment.trim() },
      {
        onSuccess: () => {
          setComment("")
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Échec de l'ajout du commentaire")
        },
      }
    )
  }

  const handleFilePicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    addAttachment.mutate(
      {
        taskId: task.id,
        uploadedById: user.id,
        file: { name: file.name, sizeKb: Math.round(file.size / 1024) || 12, type: file.type || "fichier" },
      },
      {
        onSuccess: () => toast.success("Pièce jointe ajoutée."),
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Échec de l'ajout de la pièce jointe")
        },
      }
    )
    e.target.value = ""
  }

  const handleDelete = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        toast.success("Tâche supprimée avec succès.")
        setDeleteOpen(false)
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Impossible de supprimer cette tâche.")
      },
    })
  }

  return (
    <>
      <Dialog open={Boolean(taskId)} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={TASK_STATUS_COLORS[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
              <Badge className={TASK_PRIORITY_COLORS[task.priority]}>{TASK_PRIORITY_LABELS[task.priority]}</Badge>
              <Badge variant="outline">{TASK_CATEGORY_LABELS[task.category]}</Badge>
              {overdue && <Badge variant="destructive">En retard</Badge>}
            </div>
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">{task.description}</p>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progression</span>
                <span>{task.progress}%</span>
              </div>
              <Progress value={task.progress} />
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Assigné à</p>
                <div className="flex items-center gap-1.5">
                  <Avatar className="size-5">
                    <AvatarFallback className="text-[10px]">
                      {assignee ? initials(assignee.firstName, assignee.lastName) : <UserIcon className="size-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium">
                    {assignee ? `${assignee.firstName} ${assignee.lastName}` : "Non assigné"}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Créée par</p>
                <p className="font-medium">{creator ? `${creator.firstName} ${creator.lastName}` : "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Créée le</p>
                <p className="font-medium">{formatDate(task.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Échéance</p>
                <p className={overdue ? "font-medium text-destructive" : "font-medium"}>
                  {formatDate(task.dueDate)}
                </p>
              </div>
            </div>

            {canModify && (
              <div className="flex flex-wrap items-center gap-3">
                <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
                  <SelectTrigger size="sm" className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {TASK_STATUS_LABELS[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {task.status !== "done" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange("done")}
                    className="gap-1.5"
                  >
                    <CheckCircle2Icon className="size-4" /> Marquer comme terminée
                  </Button>
                )}

                <div className="ml-auto flex items-center gap-1.5">
                  <Button size="sm" variant="ghost" onClick={() => setEditOpen(true)}>
                    <PencilIcon /> Modifier
                  </Button>
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteOpen(true)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2Icon /> Supprimer
                    </Button>
                  )}
                </div>
              </div>
            )}

            <Tabs defaultValue="comments">
              <TabsList>
                <TabsTrigger value="comments">Commentaires ({task.comments.length})</TabsTrigger>
                <TabsTrigger value="attachments">Pièces jointes ({task.attachments.length})</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="space-y-3 pt-3">
                <div className="max-h-48 space-y-3 overflow-y-auto pr-1">
                  {task.comments.length === 0 && (
                    <p className="text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>
                  )}
                  {task.comments.map((c) => {
                    const author = usersById.get(c.authorId)
                    return (
                      <div key={c.id} className="flex items-start gap-2.5">
                        <Avatar className="size-7">
                          <AvatarFallback className="text-xs">
                            {author ? initials(author.firstName, author.lastName) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 rounded-lg bg-muted/40 px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium">
                              {author ? `${author.firstName} ${author.lastName}` : "Utilisateur"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{formatRelative(c.createdAt)}</p>
                          </div>
                          <p className="text-sm">{c.content}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {canModify && (
                  <div className="flex gap-2">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      rows={2}
                      className="flex-1"
                    />
                    <Button size="icon" onClick={handleAddComment} disabled={addComment.isPending}>
                      <SendIcon />
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="attachments" className="space-y-3 pt-3">
                {task.attachments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune pièce jointe.</p>
                ) : (
                  <div className="space-y-2">
                    {task.attachments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                      >
                        <PaperclipIcon className="size-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{a.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(a.sizeKb)} · {formatDate(a.uploadedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {canModify && (
                  <>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePicked} />
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <UploadIcon /> Ajouter une pièce jointe
                    </Button>
                  </>
                )}
              </TabsContent>

              <TabsContent value="history" className="pt-3">
                <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                  {task.history.map((h) => {
                    const actor = usersById.get(h.actorId)
                    return (
                      <div key={h.id} className="flex items-start gap-2.5 text-sm">
                        <CalendarIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        <div>
                          <p>
                            <span className="font-medium">
                              {actor ? `${actor.firstName} ${actor.lastName}` : "Utilisateur"}
                            </span>{" "}
                            <span className="text-muted-foreground">{h.detail}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(h.createdAt)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <TaskFormModal open={editOpen} onOpenChange={setEditOpen} task={task} />
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer cette tâche ?"
        description="Cette tâche ne sera plus visible dans votre liste, mais reste récupérable depuis la corbeille."
        onConfirm={handleDelete}
        isLoading={deleteTask.isPending}
      />
    </>
  )
}
