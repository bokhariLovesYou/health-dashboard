import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
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
          <span className="font-medium">{p.value} mmHg</span>
        </div>
      ))}
    </div>
  )
}

export function BPChart({ data }) {
  // Aggregate: for each date, use the FIRST morning reading (earliest time)
  const byDate = {}
  data.forEach(r => {
    if (!r.date || !r.systolic) return
    const key = format(r.date, 'MMM d')
    if (!byDate[key]) {
      byDate[key] = { date: key, fullDate: r.date, readings: [] }
    }
    byDate[key].readings.push(r)
  })

  const chartData = Object.values(byDate)
    .sort((a, b) => a.fullDate - b.fullDate)
    .map(d => {
      const morning = d.readings
        .filter(r => r.systolic)
        .sort((a, b) => a.time.localeCompare(b.time))[0]
      const allSys = d.readings.filter(r => r.systolic).map(r => r.systolic)
      const allDia = d.readings.filter(r => r.diastolic).map(r => r.diastolic)
      const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null
      return {
        date: d.date,
        'Systolic (avg)': avg(allSys),
        'Diastolic (avg)': avg(allDia),
        'Systolic (AM)': morning?.systolic ?? null,
        'Diastolic (AM)': morning?.diastolic ?? null,
      }
    })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Blood Pressure</CardTitle>
        <CardDescription>Daily averages — systolic &amp; diastolic (mmHg)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis domain={[50, 160]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={120} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Normal', fontSize: 10, fill: '#f59e0b' }} />
            <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="Systolic (avg)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
            <Line type="monotone" dataKey="Diastolic (avg)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
