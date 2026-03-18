import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format } from 'date-fns'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold">{d.dateLabel}</p>
      <p className="text-muted-foreground">{d.time}</p>
      <p className="font-bold text-lg">{d.value} mg/dL</p>
      {d.note && <p className="text-xs text-muted-foreground italic mt-0.5">{d.note}</p>}
    </div>
  )
}

function getColor(value) {
  if (value < 70) return '#ef4444'   // Low - red
  if (value <= 100) return '#10b981' // Normal fasting - green
  if (value <= 140) return '#f59e0b' // Normal post-meal - amber
  if (value <= 180) return '#f97316' // Elevated - orange
  return '#ef4444'                   // High - red
}

export function BloodSugarChart({ data }) {
  const points = []

  data.forEach(r => {
    if (!r.date || !r.bloodSugar?.length) return
    r.bloodSugar.forEach(bs => {
      points.push({
        dateLabel: format(r.date, 'MMM d'),
        dateNum: r.date.getTime(),
        time: bs.time,
        value: bs.value,
        note: bs.note,
        x: r.date.getTime(),
      })
    })
  })

  points.sort((a, b) => a.x - b.x)

  // Build x-axis tick labels
  const uniqueDates = [...new Set(points.map(p => p.dateLabel))]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Blood Sugar</CardTitle>
        <CardDescription>Individual readings (mg/dL) — color coded by range</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 flex-wrap mb-3 text-xs">
          {[
            { label: '< 70 Low', color: '#ef4444' },
            { label: '70–100 Normal', color: '#10b981' },
            { label: '101–140 Post-meal OK', color: '#f59e0b' },
            { label: '141–180 Elevated', color: '#f97316' },
            { label: '> 180 High', color: '#ef4444' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
              <span className="text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
        {points.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            No blood sugar readings in this range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="dateLabel"
                type="category"
                allowDuplicatedCategory={false}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="value"
                domain={[60, 260]}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 3" label={{ value: 'Low', fontSize: 10, fill: '#ef4444', position: 'insideTopRight' }} />
              <ReferenceLine y={100} stroke="#10b981" strokeDasharray="4 3" label={{ value: 'Normal', fontSize: 10, fill: '#10b981', position: 'insideTopRight' }} />
              <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: 'Post-meal', fontSize: 10, fill: '#f59e0b', position: 'insideTopRight' }} />
              <Scatter data={points} dataKey="value">
                {points.map((p, i) => (
                  <Cell key={i} fill={getColor(p.value)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
