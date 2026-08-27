import { CheckCircle2Icon, ListChecksIcon, UserCheckIcon, UsersIcon } from "lucide-react"

import { StatCard } from "@/components/cards/StatCard"
import { EvolutionAreaChart } from "@/components/charts/EvolutionAreaChart"
import { StatusPieChart } from "@/components/charts/StatusPieChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useStatusDistribution, useTaskEvolution, useTaskStats } from "@/hooks/useTasks"
import { useAllUsersQuery } from "@/hooks/useUsers"
import { TASK_STATUS_LABELS } from "@/utils/constants"

export default function AdminDashboard() {
  // scope="all" : tableau de bord admin à l'échelle de la plateforme, pas
  // seulement les tâches du compte admin connecté (cf. task.service.resolveFilter).
  const { data: stats, isLoading: statsLoading } = useTaskStats("all")
  const { data: users, isLoading: usersLoading } = useAllUsersQuery()
  const { data: distribution, isLoading: distributionLoading } = useStatusDistribution("all")
  const { data: evolution, isLoading: evolutionLoading } = useTaskEvolution(14, "all")

  const activeToday = (users ?? []).filter(
    (u) => u.lastActiveAt && Date.now() - new Date(u.lastActiveAt).getTime() < 24 * 3600_000
  ).length
  const completionRate = stats && stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold">Tableau de bord admin</h1>
        <p className="text-sm text-muted-foreground">Vue d'ensemble de l'activité de toute l'organisation.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading || usersLoading || !stats || !users ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Utilisateurs" value={users.length} icon={UsersIcon} accentClassName="bg-primary/15 text-primary" />
            <StatCard
              label="Actifs aujourd'hui"
              value={activeToday}
              icon={UserCheckIcon}
              accentClassName="bg-chart-2/15 text-chart-2"
              delay={0.05}
            />
            <StatCard
              label="Total des tâches"
              value={stats.total}
              icon={ListChecksIcon}
              accentClassName="bg-chart-5/15 text-chart-5"
              delay={0.1}
            />
            <StatCard
              label="Taux de complétion"
              value={`${completionRate}%`}
              icon={CheckCircle2Icon}
              accentClassName="bg-success/15 text-success"
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
            <CardTitle>Répartition des statuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {distributionLoading || !distribution ? (
              <Skeleton className="h-65 w-full rounded-lg" />
            ) : (
              <>
                <StatusPieChart data={distribution} />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {distribution.map((d) => (
                    <div key={d.status} className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1">
                      <span className="text-muted-foreground">{TASK_STATUS_LABELS[d.status]}</span>
                      <span className="font-medium">{d.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
