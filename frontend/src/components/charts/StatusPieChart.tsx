import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { TASK_STATUS_LABELS } from "@/utils/constants"
import type { TaskStatus } from "@/types/task"

const COLORS: Record<TaskStatus, string> = {
  todo: "var(--color-chart-3)",
  in_progress: "var(--color-chart-2)",
  in_review: "var(--color-chart-5)",
  done: "var(--color-chart-1)",
}

interface StatusPieChartProps {
  data: Array<{ status: TaskStatus; count: number }>
}

export function StatusPieChart({ data }: StatusPieChartProps) {
  const chartData = data.map((d) => ({ name: TASK_STATUS_LABELS[d.status], value: d.count, status: d.status }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={COLORS[entry.status]} stroke="var(--color-card)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
