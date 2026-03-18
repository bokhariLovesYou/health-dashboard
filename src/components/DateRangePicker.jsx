import { useState, useRef, useEffect } from "react";
import {
  format,
  subDays,
  addMonths,
  subMonths,
  startOfMonth,
  isSameDay,
  isWithinInterval,
  isValid,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function CalGrid({ viewDate, from, to, hovering, onDay }) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] text-muted-foreground py-1 font-medium"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const isFrom = from && isSameDay(date, from);
          const isTo = to && isSameDay(date, to);
          const rangeEnd = to || hovering;
          const inRange =
            from &&
            rangeEnd &&
            date > from &&
            date < rangeEnd &&
            !(to && date > to);
          return (
            <button
              key={date.toISOString()}
              onClick={() => onDay(date)}
              onMouseEnter={() => {}}
              className={cn(
                "text-xs h-7 w-full rounded transition-colors",
                (isFrom || isTo) &&
                  "bg-primary text-primary-foreground font-bold",
                !isFrom && !isTo && inRange && "bg-muted",
                !isFrom && !isTo && !inRange && "hover:bg-muted",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
];

export function DateRangePicker({ from, to, minDate, maxDate, onChange }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(maxDate || new Date());
  const [selecting, setSelecting] = useState("from"); // 'from' | 'to'
  const [hovering, setHovering] = useState(null);
  const ref = useRef(null);

  // Update viewDate when maxDate becomes available
  useEffect(() => {
    if (maxDate) setViewDate(maxDate);
  }, [maxDate]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleDay(date) {
    if (selecting === "from") {
      onChange(date, null);
      setSelecting("to");
    } else {
      if (from && date < from) {
        // swap
        onChange(date, from);
      } else {
        onChange(from, date);
      }
      setSelecting("from");
      setOpen(false);
    }
  }

  function handlePreset(days) {
    if (!maxDate) return;
    onChange(subDays(maxDate, days), maxDate);
    setOpen(false);
  }

  function clearDates() {
    onChange(null, null);
    setSelecting("from");
  }

  const label =
    from && to
      ? `${format(from, "MMM d")} – ${format(to, "MMM d")}`
      : from
        ? `From ${format(from, "MMM d")}`
        : "All dates";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 h-8 px-2.5 rounded-md border text-xs font-medium transition-colors hover:bg-muted",
          (from || to) && "border-foreground",
        )}
      >
        <CalendarDays className="w-3.5 h-3.5" />
        <span>{label}</span>
        {(from || to) && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              clearDates();
            }}
            className="ml-0.5 hover:text-destructive"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 bg-card border rounded-xl shadow-xl p-4 w-72">
          {/* Presets */}
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePreset(p.days)}
                className="text-[11px] px-2 py-1 rounded-md border hover:bg-muted transition-colors font-medium"
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => {
                onChange(minDate, maxDate);
                setOpen(false);
              }}
              className="text-[11px] px-2 py-1 rounded-md border hover:bg-muted transition-colors font-medium"
            >
              All time
            </button>
          </div>

          {/* Month nav */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setViewDate((d) => subMonths(d, 1))}
              className="p-1 hover:bg-muted rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              onClick={() => setViewDate((d) => addMonths(d, 1))}
              className="p-1 hover:bg-muted rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar grid */}
          <CalGrid
            viewDate={viewDate}
            from={from}
            to={to}
            hovering={hovering}
            onDay={handleDay}
          />

          {/* Status hint */}
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            {selecting === "from"
              ? "Click to set start date"
              : "Click to set end date"}
          </p>
        </div>
      )}
    </div>
  );
}
