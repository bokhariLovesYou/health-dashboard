import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatsCard({ title, value, subtitle, icon: Icon, trend, className }) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">{title}</p>
            <p className="text-2xl font-bold mt-1 tabular-nums">{value ?? '—'}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            {trend !== undefined && trend !== null && (
              <p className={cn("text-xs mt-1 font-medium", trend > 0 ? "text-red-500" : trend < 0 ? "text-green-500" : "text-muted-foreground")}>
                {trend > 0 ? '▲' : trend < 0 ? '▼' : '→'} {Math.abs(trend).toFixed(1)} vs prev week
              </p>
            )}
          </div>
          {Icon && (
            <div className="ml-3 p-2 rounded-md bg-muted shrink-0">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
