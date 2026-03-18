import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format } from 'date-fns'

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: p.color }} />
          <span className="font-medium">{p.value} {unit}</span>
        </div>
      ))}
    </div>
  )
}

export function WeightChart({ data, unit = 'kg' }) {
  const weightRows = data
    .filter(r => r.date && (unit === 'kg' ? r.weightKg : r.weightLbs))
    .sort((a, b) => a.date - b.date)

  // One point per date (morning weigh-in)
  const byDate = {}
  weightRows.forEach(r => {
    const key = format(r.date, 'MMM d')
    if (!byDate[key]) {
      byDate[key] = { date: key, fullDate: r.date, weight: unit === 'kg' ? r.weightKg : r.weightLbs }
    }
  })

  const chartData = Object.values(byDate).sort((a, b) => a.fullDate - b.fullDate)

  // Trend & insights
  const weights = chartData.map(d => d.weight).filter(Boolean)
  const first = weights[0]
  const last = weights[weights.length - 1]
  const change = last && first ? (last - first).toFixed(2) : null
  const avg = weights.length ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(2) : null

  // Reference: goal line could be set to ideal weight
  const refWeight = unit === 'kg' ? 70 : 154.3

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Weight Trend</CardTitle>
            <CardDescription>Morning weigh-ins over time ({unit})</CardDescription>
          </div>
          <div className="text-right text-xs text-muted-foreground space-y-0.5">
            {change !== null && (
              <p className={parseFloat(change) < 0 ? 'text-green-500 font-medium' : 'text-orange-500 font-medium'}>
                {parseFloat(change) < 0 ? '▼' : '▲'} {Math.abs(change)} {unit} total
              </p>
            )}
            {avg && <p>Avg: {avg} {unit}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `${v}`}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <ReferenceLine y={refWeight} stroke="#10b981" strokeDasharray="5 3"
              label={{ value: `Goal ${refWeight}${unit}`, fontSize: 10, fill: '#10b981', position: 'insideTopRight' }} />
            <Line
              type="monotone"
              dataKey="weight"
              name={`Weight (${unit})`}
              stroke="#f97316"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
