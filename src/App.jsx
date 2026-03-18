import { useState, useMemo } from "react";
import {
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  Moon,
  Sun,
  Activity,
  Heart,
  Scale,
  Droplets,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { format, subDays, isValid } from "date-fns";
import { useHealthData } from "./hooks/useHealthData";
import { BPChart } from "./components/BPChart";
import { PulseChart } from "./components/PulseChart";
import { WeightChart } from "./components/WeightChart";
import { BloodSugarChart } from "./components/BloodSugarChart";
import { WeightInsights } from "./components/WeightInsights";
import { DataTable } from "./components/DataTable";
import { StatsCard } from "./components/StatsCard";
import { DateRangePicker } from "./components/DateRangePicker";
import { Button } from "./components/ui/button";

const TABS = [
  { path: "/", label: "Overview" },
  { path: "/bp", label: "Blood Pressure" },
  { path: "/pulse", label: "Heart Rate" },
  { path: "/weight", label: "Weight" },
  { path: "/sugar", label: "Blood Sugar" },
  { path: "/data", label: "All Data" },
];

export default function App() {
  const [dark, setDark] = useState(false);
  const [weightUnit, setWeightUnit] = useState("kg");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const { rawRows, loading, error } = useHealthData();

  if (dark) document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");

  // Derive min/max dates from data for the picker
  const { minDate, maxDate } = useMemo(() => {
    if (!rawRows.length) return { minDate: null, maxDate: null };
    const dates = rawRows.map((r) => r.date).filter(Boolean);
    return {
      minDate: new Date(Math.min(...dates)),
      maxDate: new Date(Math.max(...dates)),
    };
  }, [rawRows]);

  const filteredData = useMemo(() => {
    if (!rawRows.length) return [];
    return rawRows.filter((r) => {
      if (!r.date) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59);
        if (r.date > end) return false;
      }
      return true;
    });
  }, [rawRows, dateFrom, dateTo]);

  const stats = useMemo(() => {
    if (!filteredData.length) return {};
    const bpRows = filteredData.filter((r) => r.systolic);
    const pulseRows = filteredData.filter((r) => r.pulse);
    const weightRows = filteredData.filter((r) =>
      weightUnit === "kg" ? r.weightKg : r.weightLbs,
    );
    const bsAll = filteredData.flatMap((r) => r.bloodSugar || []);
    const avg = (arr) =>
      arr.length
        ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(0)
        : null;
    const sortedW = [...weightRows].sort((a, b) => a.date - b.date);
    const latestW = sortedW[sortedW.length - 1];
    const wVal = latestW
      ? weightUnit === "kg"
        ? latestW.weightKg
        : latestW.weightLbs
      : null;
    return {
      avgSystolic: avg(bpRows.map((r) => r.systolic)),
      avgDiastolic: avg(bpRows.map((r) => r.diastolic)),
      avgPulse: avg(pulseRows.map((r) => r.pulse)),
      latestWeight: wVal ? wVal.toFixed(1) : null,
      latestWeightDate: latestW?.date ? format(latestW.date, "MMM d") : null,
      avgBS: avg(bsAll.map((b) => b.value)),
      totalReadings: filteredData.length,
    };
  }, [filteredData, weightUnit]);

  const sharedProps = { data: filteredData, weightUnit, stats };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Heart className="w-5 h-5 text-red-500 shrink-0" />
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-base leading-tight truncate">
                Amjad Bukhari
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Health Dashboard · DOB Feb 9, 1954
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Weight unit toggle */}
            <div className="flex rounded-md border overflow-hidden text-xs">
              <button
                onClick={() => setWeightUnit("kg")}
                className={`px-2.5 py-1.5 font-medium transition-colors ${weightUnit === "kg" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                kg
              </button>
              <button
                onClick={() => setWeightUnit("lbs")}
                className={`px-2.5 py-1.5 font-medium transition-colors border-l ${weightUnit === "lbs" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                lbs
              </button>
            </div>
            {/* Date range picker */}
            <DateRangePicker
              from={dateFrom}
              to={dateTo}
              minDate={minDate}
              maxDate={maxDate}
              onChange={(from, to) => {
                setDateFrom(from);
                setDateTo(to);
              }}
            />
            {/* Dark mode */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDark((d) => !d)}
            >
              {dark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="border-b bg-background sticky top-14 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto">
          {TABS.map((t) => (
            <NavLink
              key={t.path}
              to={t.path}
              end={t.path === "/"}
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {loading && (
          <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Fetching data from Google Sheets…</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Failed to load data</p>
              <p className="text-xs mt-0.5 opacity-80">{error}</p>
            </div>
          </div>
        )}
        {!loading && !error && filteredData.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No data found for the selected range.
          </div>
        )}
        {!loading && !error && filteredData.length > 0 && (
          <Routes>
            <Route path="/" element={<OverviewPage {...sharedProps} />} />
            <Route path="/bp" element={<BPPage {...sharedProps} />} />
            <Route path="/pulse" element={<PulsePage {...sharedProps} />} />
            <Route path="/weight" element={<WeightPage {...sharedProps} />} />
            <Route path="/sugar" element={<SugarPage {...sharedProps} />} />
            <Route path="/data" element={<DataPage {...sharedProps} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>

      <footer className="border-t mt-12 py-4 text-center text-xs text-muted-foreground">
        Data fetched live from Google Sheets · {stats.totalReadings ?? 0}{" "}
        readings
      </footer>
    </div>
  );
}

/* ── Page components ───────────────────────────────────────────── */

function StatBox({ label, value }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
    </div>
  );
}

function OverviewPage({ data, weightUnit, stats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Avg Blood Pressure"
          value={
            stats.avgSystolic && stats.avgDiastolic
              ? `${stats.avgSystolic}/${stats.avgDiastolic}`
              : "—"
          }
          subtitle="mmHg · systolic/diastolic"
          icon={Activity}
        />
        <StatsCard
          title="Avg Heart Rate"
          value={stats.avgPulse ? `${stats.avgPulse} bpm` : "—"}
          subtitle="Average pulse"
          icon={Heart}
        />
        <StatsCard
          title="Latest Weight"
          value={
            stats.latestWeight ? `${stats.latestWeight} ${weightUnit}` : "—"
          }
          subtitle={
            stats.latestWeightDate
              ? `As of ${stats.latestWeightDate}`
              : "No data"
          }
          icon={Scale}
        />
        <StatsCard
          title="Avg Blood Sugar"
          value={stats.avgBS ? `${stats.avgBS} mg/dL` : "—"}
          subtitle="Average of all readings"
          icon={Droplets}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BPChart data={data} />
        <PulseChart data={data} />
        <WeightChart data={data} unit={weightUnit} />
        <BloodSugarChart data={data} />
      </div>
      <WeightInsights data={data} unit={weightUnit} />
    </div>
  );
}

function BPPage({ data, stats }) {
  const [view, setView] = useState("average");
  const high = data.filter((r) => r.systolic >= 130).length;
  const low = data.filter((r) => r.systolic && r.systolic < 90).length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox
          label="Avg Systolic"
          value={stats.avgSystolic ? `${stats.avgSystolic} mmHg` : "—"}
        />
        <StatBox
          label="Avg Diastolic"
          value={stats.avgDiastolic ? `${stats.avgDiastolic} mmHg` : "—"}
        />
        <StatBox label="High Readings (≥130)" value={high} />
        <StatBox label="Low Readings (<90)" value={low} />
      </div>

      {/* Toggle */}
      <div className="flex rounded-md border w-fit overflow-hidden text-xs">
        <button
          onClick={() => setView("average")}
          className={`px-3 py-1.5 font-medium transition-colors ${view === "average" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          Daily Average
        </button>
        <button
          onClick={() => setView("all")}
          className={`px-3 py-1.5 font-medium transition-colors border-l ${view === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          All Readings
        </button>
      </div>

      <BPChart data={data} view={view} />
    </div>
  );
}

function PulsePage({ data, stats }) {
  const [view, setView] = useState("average");
  const pulses = data.filter((r) => r.pulse).map((r) => r.pulse);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatBox
          label="Avg Pulse"
          value={stats.avgPulse ? `${stats.avgPulse} bpm` : "—"}
        />
        <StatBox
          label="Highest"
          value={pulses.length ? Math.max(...pulses) + " bpm" : "—"}
        />
        <StatBox
          label="Lowest"
          value={pulses.length ? Math.min(...pulses) + " bpm" : "—"}
        />
      </div>

      {/* Toggle */}
      <div className="flex rounded-md border w-fit overflow-hidden text-xs">
        <button
          onClick={() => setView("average")}
          className={`px-3 py-1.5 font-medium transition-colors ${view === "average" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          Daily Average
        </button>
        <button
          onClick={() => setView("all")}
          className={`px-3 py-1.5 font-medium transition-colors border-l ${view === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          All Readings
        </button>
      </div>

      <PulseChart data={data} view={view} />
    </div>
  );
}

function WeightPage({ data, weightUnit }) {
  return (
    <div className="space-y-6">
      <WeightInsights data={data} unit={weightUnit} />
      <WeightChart data={data} unit={weightUnit} />
    </div>
  );
}

function SugarPage({ data }) {
  return <BloodSugarChart data={data} />;
}

function DataPage({ data, weightUnit }) {
  return <DataTable data={data} weightUnit={weightUnit} />;
}
