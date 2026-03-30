import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { format } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ background: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium">{p.value} mmHg</span>
        </div>
      ))}
    </div>
  );
};

export function BPChart({ data, view = "average", compact = false }) {
  // All readings
  const allReadingsData = data
    .filter((r) => r.systolic && r.diastolic)
    .sort((a, b) => {
      if (a.date - b.date !== 0) return a.date - b.date;
      return a.time.localeCompare(b.time);
    })
    .map((r) => ({
      label: `${format(r.date, "MMM d")} ${r.time}`,
      Systolic: r.systolic,
      Diastolic: r.diastolic,
    }));

  // Daily average
  const byDate = {};
  data.forEach((r) => {
    if (!r.date || !r.systolic) return;
    const key = format(r.date, "MMM d");
    if (!byDate[key])
      byDate[key] = { date: key, fullDate: r.date, readings: [] };
    byDate[key].readings.push(r);
  });
  const avgData = Object.values(byDate)
    .sort((a, b) => a.fullDate - b.fullDate)
    .map((d) => {
      const sys = d.readings.filter((r) => r.systolic).map((r) => r.systolic);
      const dia = d.readings.filter((r) => r.diastolic).map((r) => r.diastolic);
      const avg = (arr) =>
        arr.length
          ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
          : null;
      return { label: d.date, Systolic: avg(sys), Diastolic: avg(dia) };
    });

  const chartData = view === "all" ? allReadingsData : avgData;

  // X-axis config differs between compact (overview) and full (individual page)
  const xAxisProps =
    view === "all"
      ? {
          angle: -45,
          textAnchor: "end",
          interval: Math.floor(chartData.length / 10),
          height: 50,
          tick: { fontSize: 10 },
        }
      : {
          angle: -45,
          textAnchor: "end",
          interval: "preserveStartEnd",
          height: 50,
          tick: { fontSize: 11 },
        };
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Blood Pressure</CardTitle>
        <CardDescription>
          {view === "all" ? "Every individual reading" : "Daily averages"} —
          systolic &amp; diastolic (mmHg)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 16, left: -10, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              {...xAxisProps}
            />
            <YAxis
              domain={[50, 160]}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine
              y={120}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{ value: "Normal", fontSize: 10, fill: "#f59e0b" }}
            />
            <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="Systolic"
              stroke="#ef4444"
              strokeWidth={view === "all" ? 1.5 : 2}
              dot={view === "all" ? { r: 2 } : { r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="Diastolic"
              stroke="#3b82f6"
              strokeWidth={view === "all" ? 1.5 : 2}
              dot={view === "all" ? { r: 2 } : { r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
