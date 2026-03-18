import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, differenceInDays, subDays } from "date-fns";

export function WeightInsights({ data, unit }) {
  const weightRows = data
    .filter((r) => r.date && (unit === "kg" ? r.weightKg : r.weightLbs))
    .sort((a, b) => a.date - b.date);

  if (weightRows.length < 2) return null;

  const weights = weightRows.map((r) =>
    unit === "kg" ? r.weightKg : r.weightLbs,
  );
  const first = weights[0];
  const last = weights[weights.length - 1];
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
  const totalChange = last - first;
  const days = differenceInDays(
    weightRows[weightRows.length - 1].date,
    weightRows[0].date,
  );
  const ratePerWeek = days > 0 ? (totalChange / days) * 7 : 0;

  // Avg weight last 7 days
  const latestDate = weightRows[weightRows.length - 1].date;
  const sevenDaysAgo = subDays(latestDate, 7);
  const last7Weights = weightRows
    .filter((r) => r.date >= sevenDaysAgo)
    .map((r) => (unit === "kg" ? r.weightKg : r.weightLbs));
  const avg7 = last7Weights.length
    ? last7Weights.reduce((a, b) => a + b, 0) / last7Weights.length
    : null;

  const minRow = weightRows.find(
    (r) => (unit === "kg" ? r.weightKg : r.weightLbs) === min,
  );
  const maxRow = weightRows.find(
    (r) => (unit === "kg" ? r.weightKg : r.weightLbs) === max,
  );

  const insights = [
    {
      label: "Total Change",
      value: `${totalChange > 0 ? "+" : ""}${totalChange.toFixed(2)} ${unit}`,
      sub: `Over ${days} days`,
    },
    {
      label: "Rate of Change",
      value: `${ratePerWeek > 0 ? "+" : ""}${ratePerWeek.toFixed(2)} ${unit}/wk`,
      sub: "Average weekly",
    },
    {
      label: "Avg (Last 7 Days)",
      value: avg7 ? `${avg7.toFixed(2)} ${unit}` : "—",
      sub: `${last7Weights.length} weigh-in${last7Weights.length !== 1 ? "s" : ""}`,
    },
    {
      label: "Lowest",
      value: `${min.toFixed(2)} ${unit}`,
      sub: minRow?.date ? format(minRow.date, "MMM d") : "",
    },
    {
      label: "Highest",
      value: `${max.toFixed(2)} ${unit}`,
      sub: maxRow?.date ? format(maxRow.date, "MMM d") : "",
    },
    {
      label: "Overall Average",
      value: `${avg.toFixed(2)} ${unit}`,
      sub: `Across ${weights.length} weigh-ins`,
    },
    {
      label: "Current",
      value: `${last.toFixed(2)} ${unit}`,
      sub: weightRows[weightRows.length - 1]?.date
        ? format(weightRows[weightRows.length - 1].date, "MMM d")
        : "Latest",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Weight Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {insights.map((ins) => (
            <div key={ins.label} className="space-y-0.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {ins.label}
              </p>
              <p className="text-base font-bold tabular-nums text-foreground">
                {ins.value}
              </p>
              <p className="text-xs text-muted-foreground">{ins.sub}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
