import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
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
          <span className="font-medium">{p.value} bpm</span>
        </div>
      ))}
    </div>
  );
};

export function PulseChart({ data, view = "average", compact = false }) {
  // All readings
  const allReadingsData = data
    .filter((r) => r.pulse)
    .sort((a, b) => {
      if (a.date - b.date !== 0) return a.date - b.date;
      return a.time.localeCompare(b.time);
    })
    .map((r) => ({
      label: `${format(r.date, "MMM d")} ${r.time}`,
      Pulse: r.pulse,
    }));

  // Daily average
  const byDate = {};
  data.forEach((r) => {
    if (!r.date || !r.pulse) return;
    const key = format(r.date, "MMM d");
    if (!byDate[key]) byDate[key] = { date: key, fullDate: r.date, pulses: [] };
    byDate[key].pulses.push(r.pulse);
  });
  const avgData = Object.values(byDate)
    .sort((a, b) => a.fullDate - b.fullDate)
    .map((d) => ({
      label: d.date,
      "Pulse (avg)": Math.round(
        d.pulses.reduce((a, b) => a + b, 0) / d.pulses.length,
      ),
      "Pulse (min)": Math.min(...d.pulses),
      "Pulse (max)": Math.max(...d.pulses),
    }));

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
        <CardTitle className="text-base">Heart Rate / Pulse</CardTitle>
        <CardDescription>
          {view === "all" ? "Every individual reading" : "Daily avg, min & max"}{" "}
          (bpm)
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
              domain={[40, 100]}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine
              y={60}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{ value: "Normal low", fontSize: 10, fill: "#10b981" }}
            />
            <ReferenceLine
              y={80}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{ value: "Normal high", fontSize: 10, fill: "#f59e0b" }}
            />
            {view === "all" ? (
              <Line
                type="monotone"
                dataKey="Pulse"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="Pulse (avg)"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="Pulse (min)"
                  stroke="#a78bfa"
                  strokeWidth={1}
                  strokeDasharray="4 2"
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="Pulse (max)"
                  stroke="#6d28d9"
                  strokeWidth={1}
                  strokeDasharray="4 2"
                  dot={false}
                  connectNulls
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
