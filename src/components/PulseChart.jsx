import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format } from 'date-fns'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium">{p.value} bpm</span>
        </div>
      ))}
    </div>
  )
}

export function PulseChart({ data }) {
  const byDate = {}
  data.forEach(r => {
    if (!r.date || !r.pulse) return
    const key = format(r.date, 'MMM d')
    if (!byDate[key]) byDate[key] = { date: key, fullDate: r.date, pulses: [] }
    byDate[key].pulses.push(r.pulse)
  })

  const chartData = Object.values(byDate)
    .sort((a, b) => a.fullDate - b.fullDate)
    .map(d => ({
      date: d.date,
      'Pulse (avg)': d.pulses.length ? Math.round(d.pulses.reduce((a, b) => a + b, 0) / d.pulses.length) : null,
      'Pulse (min)': Math.min(...d.pulses),
      'Pulse (max)': Math.max(...d.pulses),
    }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Heart Rate / Pulse</CardTitle>
        <CardDescription>Daily avg, min &amp; max (bpm)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={60} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Normal low', fontSize: 10, fill: '#10b981' }} />
            <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Normal high', fontSize: 10, fill: '#f59e0b' }} />
            <Line type="monotone" dataKey="Pulse (avg)" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
            <Line type="monotone" dataKey="Pulse (min)" stroke="#a78bfa" strokeWidth={1} strokeDasharray="4 2" dot={false} connectNulls />
            <Line type="monotone" dataKey="Pulse (max)" stroke="#6d28d9" strokeWidth={1} strokeDasharray="4 2" dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
