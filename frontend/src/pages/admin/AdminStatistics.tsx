import { EvolutionAreaChart } from "@/components/charts/EvolutionAreaChart"
import { StatusPieChart } from "@/components/charts/StatusPieChart"
import { UserDistributionBarChart } from "@/components/charts/UserDistributionBarChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useStatusDistribution,
  useTaskEvolution,
  useTasksPerUser,
} from "@/hooks/useTasks"
import { useAllUsersQuery } from "@/hooks/useUsers"

export default function AdminStatistics() {
  // scope="all" : statistiques à l'échelle de la plateforme (cf. AdminDashboard).
  const { data: distribution, isLoading: distributionLoading } = useStatusDistribution("all")
  const { data: perUser, isLoading: perUserLoading } = useTasksPerUser("all")
  const { data: evolution, isLoading: evolutionLoading } = useTaskEvolution(30, "all")
  const { data: users } = useAllUsersQuery()

  const usersById = new Map((users ?? []).map((u) => [u.id, u]))
  const barData = (perUser ?? [])
    .map((p) => ({ name: usersById.get(p.userId)?.firstName ?? "—", count: p.count }))
    .sort((a, b) => b.count - a.count)

  const maxCount = Math.max(1, ...barData.map((d) => d.count))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold">Statistiques avancées</h1>
        <p className="text-sm text-muted-foreground">
          Analysez la productivité et la répartition du travail au sein de l'équipe.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
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
            <CardTitle>Répartition des tâches par statut</CardTitle>
          </CardHeader>
          <CardContent>
            {distributionLoading || !distribution ? (
              <Skeleton className="h-65 w-full rounded-lg" />
            ) : (
              <StatusPieChart data={distribution} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tâches par utilisateur</CardTitle>
          </CardHeader>
          <CardContent>
            {perUserLoading || !perUser ? (
              <Skeleton className="h-70 w-full rounded-lg" />
            ) : (
              <UserDistributionBarChart data={barData} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productivité par utilisateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {perUserLoading || !perUser ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              barData.map((d) => (
                <div key={d.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{d.name}</span>
                    <span className="text-muted-foreground">{d.count} tâches</span>
                  </div>
                  <Progress value={(d.count / maxCount) * 100} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
