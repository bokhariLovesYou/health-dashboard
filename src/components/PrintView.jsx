import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { BPChart } from "./BPChart";
import { PulseChart } from "./PulseChart";
import { WeightChart } from "./WeightChart";
import { BloodSugarChart } from "./BloodSugarChart";
import { WeightInsights } from "./WeightInsights";
import { DataTable } from "./DataTable";
import { StatsCard } from "./StatsCard";
import { DateRangePicker } from "./DateRangePicker";
import { Activity, Heart, Scale, Droplets, X } from "lucide-react";

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

function SectionHeader({ number, title }) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-3 border-b">
      <span className="text-xs font-bold bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center shrink-0">
        {number}
      </span>
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );
}

export function PrintView({
  data,
  weightUnit: initialWeightUnit,
  stats,
  dateFrom,
  dateTo,
  onDateChange,
}) {
  const navigate = useNavigate();
  const [weightUnit, setWeightUnit] = useState(initialWeightUnit ?? "kg");

  const allDates = data.map((r) => r.date).filter(Boolean);
  const minDate = allDates.length ? new Date(Math.min(...allDates)) : null;
  const maxDate = allDates.length ? new Date(Math.max(...allDates)) : null;

  const bpHigh = data.filter((r) => r.systolic >= 130).length;
  const bpLow = data.filter((r) => r.systolic && r.systolic < 90).length;
  const pulses = data.filter((r) => r.pulse).map((r) => r.pulse);
  const today = format(new Date(), "MMMM d, yyyy");

  const dates = data.map((r) => r.date).filter(Boolean);
  const fromDate = dates.length
    ? format(new Date(Math.min(...dates)), "MMM d, yyyy")
    : "—";
  const toDate = dates.length
    ? format(new Date(Math.max(...dates)), "MMM d, yyyy")
    : "—";

  // Recompute stats based on local weight unit
  const weightRows = data.filter((r) =>
    weightUnit === "kg" ? r.weightKg : r.weightLbs,
  );
  const sortedW = [...weightRows].sort((a, b) => a.date - b.date);
  const latestW = sortedW[sortedW.length - 1];
  const wVal = latestW
    ? weightUnit === "kg"
      ? latestW.weightKg
      : latestW.weightLbs
    : null;

  const avg = (arr) =>
    arr.length
      ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(0)
      : null;
  const bpRows = data.filter((r) => r.systolic);
  const pulseRows = data.filter((r) => r.pulse);
  const bsAll = data.flatMap((r) => r.bloodSugar || []);

  const localStats = {
    avgSystolic: avg(bpRows.map((r) => r.systolic)),
    avgDiastolic: avg(bpRows.map((r) => r.diastolic)),
    avgPulse: avg(pulseRows.map((r) => r.pulse)),
    avgBS: avg(bsAll.map((b) => b.value)),
    latestWeight: wVal ? wVal.toFixed(1) : null,
    latestWeightDate: latestW?.date ? format(latestW.date, "MMM d") : null,
  };

  return (
    <div className="bg-background text-foreground">
      {/* Toolbar — full width, hidden when printing */}
      <div className="print:hidden sticky top-0 z-50 border-b bg-background/95 backdrop-blur px-4 py-3 flex flex-col gap-2">
        {/* Row 1: Close + title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" /> Close
            </button>
            <span className="text-muted-foreground">|</span>
            <span className="text-sm font-medium">Print Preview</span>
          </div>
          {/* Print button */}
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Print / Save as PDF
          </button>
        </div>
        {/* Row 2: Date picker + weight toggle */}
        <div className="flex items-center gap-2">
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            minDate={minDate}
            maxDate={maxDate}
            onChange={onDateChange}
          />
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
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-16">
        {/* ── Cover / Summary ── */}
        <section className="print-page">
          <div className="flex items-start justify-between mb-8 pb-6 border-b">
            <div>
              <h1 className="text-3xl font-bold">Health Report</h1>
              <p className="text-xl font-semibold mt-1">Amjad Bukhari</p>
              <p className="text-muted-foreground text-sm mt-0.5">
                Date of Birth: February 9, 1954
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Generated: {today}</p>
              <p className="mt-0.5">
                Data range: {fromDate} – {toDate}
              </p>
              <p className="mt-0.5">{data.length} total readings</p>
            </div>
          </div>

          <SectionHeader number="1" title="Overview" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Avg Blood Pressure"
              value={
                localStats.avgSystolic && localStats.avgDiastolic
                  ? `${localStats.avgSystolic}/${localStats.avgDiastolic}`
                  : "—"
              }
              subtitle="mmHg · systolic/diastolic"
              icon={Activity}
            />
            <StatsCard
              title="Avg Heart Rate"
              value={localStats.avgPulse ? `${localStats.avgPulse} bpm` : "—"}
              subtitle="Average pulse"
              icon={Heart}
            />
            <StatsCard
              title="Latest Weight"
              value={
                localStats.latestWeight
                  ? `${localStats.latestWeight} ${weightUnit}`
                  : "—"
              }
              subtitle={
                localStats.latestWeightDate
                  ? `As of ${localStats.latestWeightDate}`
                  : "No data"
              }
              icon={Scale}
            />
            <StatsCard
              title="Avg Blood Sugar"
              value={localStats.avgBS ? `${localStats.avgBS} mg/dL` : "—"}
              subtitle="Average of all readings"
              icon={Droplets}
            />
          </div>

          {/* All charts full width */}
          <div className="space-y-6">
            <BPChart data={data} compact />
            <PulseChart data={data} compact />
            <WeightChart data={data} unit={weightUnit} />
            <BloodSugarChart data={data} />
          </div>
        </section>

        {/* ── Blood Pressure ── */}
        <section className="print-page">
          <SectionHeader number="2" title="Blood Pressure" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatBox
              label="Avg Systolic"
              value={
                localStats.avgSystolic ? `${localStats.avgSystolic} mmHg` : "—"
              }
            />
            <StatBox
              label="Avg Diastolic"
              value={
                localStats.avgDiastolic
                  ? `${localStats.avgDiastolic} mmHg`
                  : "—"
              }
            />
            <StatBox label="High Readings (≥130)" value={bpHigh} />
            <StatBox label="Low Readings (<90)" value={bpLow} />
          </div>
          <BPChart data={data} view="average" />
        </section>

        {/* ── Heart Rate ── */}
        <section className="print-page">
          <SectionHeader number="3" title="Heart Rate" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <StatBox
              label="Avg Pulse"
              value={localStats.avgPulse ? `${localStats.avgPulse} bpm` : "—"}
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
          <PulseChart data={data} view="average" />
        </section>

        {/* ── Weight ── */}
        <section className="print-page">
          <SectionHeader number="4" title="Weight" />
          <WeightInsights data={data} unit={weightUnit} />
          <div className="mt-6">
            <WeightChart data={data} unit={weightUnit} />
          </div>
        </section>

        {/* ── Blood Sugar ── */}
        <section className="print-page">
          <SectionHeader number="5" title="Blood Sugar" />
          <BloodSugarChart data={data} />
        </section>

        {/* ── All Data ── */}
        <section className="print-page">
          <SectionHeader number="6" title="All Readings" />
          <DataTable data={data} weightUnit={weightUnit} />
        </section>
      </div>
    </div>
  );
}
