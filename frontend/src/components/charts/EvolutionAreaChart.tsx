import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

interface EvolutionAreaChartProps {
  data: Array<{ date: string; created: number; completed: number }>
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">
        {label ? format(parseISO(label), "d MMMM", { locale: fr }) : ""}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name} : <span className="font-medium text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

export function EvolutionAreaChart({ data }: EvolutionAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
            <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => format(parseISO(value), "d MMM", { locale: fr })}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="created"
          name="Créées"
          stroke="var(--color-chart-2)"
          fill="url(#colorCreated)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="completed"
          name="Terminées"
          stroke="var(--color-chart-1)"
          fill="url(#colorCompleted)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
