import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'
import { cn } from "@/lib/utils"

function BPBadge({ systolic, diastolic }) {
  if (!systolic || !diastolic) return <span className="text-muted-foreground">—</span>
  let variant = 'outline'
  let label = 'Normal'
  if (systolic >= 140 || diastolic >= 90) { variant = 'destructive'; label = 'High' }
  else if (systolic >= 130 || diastolic >= 80) { variant = 'secondary'; label = 'Elevated' }
  else if (systolic < 90 || diastolic < 60) { variant = 'secondary'; label = 'Low' }
  return (
    <div className="flex items-center gap-2">
      <span className="tabular-nums font-mono text-sm">{systolic}/{diastolic}</span>
      <Badge variant={variant} className="text-[10px] px-1.5 py-0">{label}</Badge>
    </div>
  )
}

function PulseCell({ pulse }) {
  if (!pulse) return <span className="text-muted-foreground">—</span>
  const color = pulse < 60 ? 'text-blue-500' : pulse > 80 ? 'text-orange-500' : 'text-green-500'
  return <span className={cn("tabular-nums font-mono text-sm", color)}>{pulse} bpm</span>
}

export function DataTable({ data, weightUnit }) {
  const sorted = [...data].sort((a, b) => {
    if (a.date - b.date !== 0) return a.date - b.date
    return a.time.localeCompare(b.time)
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">All Readings</CardTitle>
        <CardDescription>{sorted.length} entries in selected range</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {['Date', 'Day', 'Time', 'Blood Pressure', 'Pulse', `Weight (${weightUnit})`, 'Blood Sugar'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const weight = weightUnit === 'kg' ? r.weightKg : r.weightLbs
                const bsText = r.bloodSugar?.length
                  ? r.bloodSugar.map(b => `${b.value}${b.note ? ` (${b.note})` : ''}`).join(', ')
                  : null
                return (
                  <tr key={r.id} className={cn("border-b last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 0 ? '' : 'bg-muted/10')}>
                    <td className="px-4 py-2.5 whitespace-nowrap font-medium">
                      {r.date ? format(r.date, 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.day}</td>
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{r.time || '—'}</td>
                    <td className="px-4 py-2.5"><BPBadge systolic={r.systolic} diastolic={r.diastolic} /></td>
                    <td className="px-4 py-2.5"><PulseCell pulse={r.pulse} /></td>
                    <td className="px-4 py-2.5 tabular-nums">
                      {weight ? <span className="font-mono">{weight.toFixed(2)} {weightUnit}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      {bsText
                        ? <span className="tabular-nums font-mono text-sm">{bsText} mg/dL</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
