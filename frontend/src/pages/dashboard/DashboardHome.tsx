import { Link } from "react-router-dom"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClockIcon,
  ListChecksIcon,
  PlusIcon,
} from "lucide-react"

import { ActivityCard } from "@/components/cards/ActivityCard"
import { StatCard } from "@/components/cards/StatCard"
import { EvolutionAreaChart } from "@/components/charts/EvolutionAreaChart"
import { NotificationItem } from "@/components/notifications/NotificationItem"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useNotifications } from "@/hooks/useNotifications"
import { useRecentActivity, useTaskEvolution, useTaskStats } from "@/hooks/useTasks"
import { useAllUsersQuery } from "@/hooks/useUsers"
import { useAuthStore } from "@/store/authStore"

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user)
  const { data: stats, isLoading: statsLoading } = useTaskStats()
  const { data: evolution, isLoading: evolutionLoading } = useTaskEvolution(14)
  const { data: activity, isLoading: activityLoading } = useRecentActivity(6)
  const { data: users } = useAllUsersQuery()
  const { notifications, markAsRead } = useNotifications()

  const usersById = new Map((users ?? []).map((u) => [u.id, u]))
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-brand text-2xl font-semibold">
            {greeting}, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Voici un aperçu de l'activité de votre équipe aujourd'hui.
          </p>
        </div>
        <Button asChild>
          <Link to="/tasks">
            <PlusIcon /> Nouvelle tâche
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <StatCard
              label="Total des tâches"
              value={stats.total}
              icon={ListChecksIcon}
              accentClassName="bg-primary/15 text-primary"
              delay={0}
            />
            <StatCard
              label="Terminées"
              value={stats.completed}
              icon={CheckCircle2Icon}
              accentClassName="bg-success/15 text-success"
              delay={0.05}
            />
            <StatCard
              label="En cours"
              value={stats.inProgress}
              icon={ClockIcon}
              accentClassName="bg-chart-2/15 text-chart-2"
              delay={0.1}
            />
            <StatCard
              label="En retard"
              value={stats.overdue}
              icon={AlertTriangleIcon}
              accentClassName="bg-destructive/15 text-destructive"
              delay={0.15}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Évolution des tâches</CardTitle>
          </CardHeader>
          <CardContent>
            {evolutionLoading || !evolution ? (
              <Skeleton className="h-70 w-full rounded-lg" />
            ) : (
              <EvolutionAreaChart data={evolution} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications récentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border px-2">
              {notifications.slice(0, 4).map((n) => (
                <NotificationItem key={n.id} notification={n} onMarkAsRead={() => markAsRead.mutate(n.id)} />
              ))}
              {notifications.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Aucune notification pour le moment.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {activityLoading || !activity ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Aucune activité récente.</p>
          ) : (
            activity.map((entry) => (
              <ActivityCard key={entry.id} entry={entry} actor={usersById.get(entry.actorId)} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
