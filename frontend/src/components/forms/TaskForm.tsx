import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, CheckIcon, ChevronsUpDownIcon, LoaderCircleIcon, PlusIcon, XIcon } from "lucide-react"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { initials } from "@/lib/format"
import { useAllUsersQuery } from "@/hooks/useUsers"
import {
  TASK_CATEGORY_LABELS,
  TASK_PRIORITY_LABELS,
} from "@/utils/constants"
import type { Task, TaskCategory, TaskPriority } from "@/types/task"

const taskFormSchema = z.object({
  title: z.string().min(3, "3 caractères minimum"),
  description: z.string().min(10, "10 caractères minimum"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.enum(["development", "design", "marketing", "administration", "support", "research"]),
  assigneeId: z.string().nullable(),
  dueDate: z.string().nullable(),
  tags: z.array(z.string()),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

interface TaskFormProps {
  defaultValues?: Partial<TaskFormValues>
  onSubmit: (values: TaskFormValues) => void
  isSubmitting?: boolean
  submitLabel?: string
  // Utilisateur connecté, pour proposer "Moi-même" dans le sélecteur d'assigné.
  currentUser?: { id: string; firstName: string; lastName: string }
  // Seul un admin peut attribuer une tâche à un autre utilisateur que
  // lui-même (droit vérifié côté backend) : pour tout le monde d'autre,
  // le sélecteur reste limité à "Non assigné" / "Moi-même".
  canAssignOthers?: boolean
}

export function TaskForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Créer la tâche",
  currentUser,
  canAssignOthers = false,
}: TaskFormProps) {
  const { data: users } = useAllUsersQuery()
  const [tagInput, setTagInput] = useState("")
  const [assigneeMode, setAssigneeMode] = useState<"unassigned" | "self" | "other">(() => {
    const initial = defaultValues?.assigneeId
    if (!initial) return "unassigned"
    if (currentUser && initial === currentUser.id) return "self"
    return "other"
  })
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category: "development",
      assigneeId: null,
      dueDate: null,
      tags: [],
      ...defaultValues,
    },
  })

  const tags = watch("tags")

  const addTag = () => {
    const value = tagInput.trim()
    if (value && !tags.includes(value)) {
      setValue("tags", [...tags, value])
    }
    setTagInput("")
  }

  const dueDateField = (
    <div className="space-y-1.5">
      <Label>Date limite</Label>
      <Controller
        name="dueDate"
        control={control}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start font-normal">
                <CalendarIcon className="size-4" />
                {field.value ? format(parseISO(field.value), "d MMM yyyy", { locale: fr }) : "Choisir une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? parseISO(field.value) : undefined}
                onSelect={(date) => field.onChange(date ? date.toISOString() : null)}
              />
            </PopoverContent>
          </Popover>
        )}
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="title">Titre</Label>
        <Input id="title" aria-invalid={Boolean(errors.title)} {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} aria-invalid={Boolean(errors.description)} {...register("description")} />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Priorité</Label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {TASK_PRIORITY_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Catégorie</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TASK_CATEGORY_LABELS) as TaskCategory[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {TASK_CATEGORY_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {!canAssignOthers ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Assigné à</Label>
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? "unassigned"}
                  onValueChange={(v) => field.onChange(v === "unassigned" ? null : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Non assigné" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Non assigné</SelectItem>
                    {currentUser && (
                      <SelectItem value={currentUser.id}>
                        Moi-même ({currentUser.firstName} {currentUser.lastName})
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {dueDateField}
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label>Assigné à</Label>
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => {
                  const selectedUser = field.value ? users?.find((u) => u.id === field.value) : undefined
                  return (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant={assigneeMode === "unassigned" ? "default" : "outline"}
                          onClick={() => {
                            setAssigneeMode("unassigned")
                            field.onChange(null)
                          }}
                        >
                          Non assigné
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={assigneeMode === "self" ? "default" : "outline"}
                          onClick={() => {
                            setAssigneeMode("self")
                            field.onChange(currentUser?.id ?? null)
                          }}
                        >
                          Moi-même
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={assigneeMode === "other" ? "default" : "outline"}
                          onClick={() => {
                            setAssigneeMode("other")
                            setAssigneePickerOpen(true)
                          }}
                        >
                          Attribuer à un utilisateur
                        </Button>
                      </div>

                      {assigneeMode === "other" && (
                        <Popover open={assigneePickerOpen} onOpenChange={setAssigneePickerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-between font-normal"
                            >
                              {selectedUser ? (
                                <span className="flex items-center gap-2">
                                  <Avatar className="size-5">
                                    <AvatarFallback className="text-[10px]">
                                      {initials(selectedUser.firstName, selectedUser.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {selectedUser.firstName} {selectedUser.lastName}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Choisir un utilisateur...</span>
                              )}
                              <ChevronsUpDownIcon className="size-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Rechercher par nom ou e-mail..." />
                              <CommandList>
                                <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
                                <CommandGroup>
                                  {users?.map((u) => (
                                    <CommandItem
                                      key={u.id}
                                      value={`${u.firstName} ${u.lastName} ${u.email}`}
                                      onSelect={() => {
                                        field.onChange(u.id)
                                        setAssigneePickerOpen(false)
                                      }}
                                    >
                                      <Avatar className="size-6">
                                        <AvatarFallback className="text-[10px]">
                                          {initials(u.firstName, u.lastName)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="flex min-w-0 flex-col">
                                        <span className="truncate text-sm">
                                          {u.firstName} {u.lastName}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">{u.email}</span>
                                      </span>
                                      {field.value === u.id && <CheckIcon className="ml-auto size-4 shrink-0" />}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  )
                }}
              />
            </div>
          {dueDateField}
        </>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="tag-input">Étiquettes</Label>
        <div className="flex gap-2">
          <Input
            id="tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder="Ajouter une étiquette et Entrée"
          />
          <Button type="button" variant="outline" size="icon" onClick={addTag}>
            <PlusIcon />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => setValue("tags", tags.filter((t) => t !== tag))}
                  aria-label={`Retirer ${tag}`}
                  className="cursor-pointer"
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <LoaderCircleIcon className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  )
}

export function taskToFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    category: task.category,
    assigneeId: task.assigneeId,
    dueDate: task.dueDate,
    tags: task.tags,
  }
}
