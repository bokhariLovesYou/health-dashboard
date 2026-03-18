import { useState, useEffect } from "react";
import Papa from "papaparse";

const CSV_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTHHBnopbzWQ6eTze1k23s4RTYOwqcLj3xdxzsHU_EV9gwuGTfEWFUgmXs8brMAdMfJXWkiTBo3XjjG/pub?output=csv`;

function parseDate(dayStr, dateStr) {
  if (!dateStr) return null;
  try {
    const parts = dateStr.trim().split("-");
    if (parts.length !== 2) return null;
    const day = parseInt(parts[0], 10);
    const monthMap = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };
    const month = monthMap[parts[1]];
    if (month === undefined || isNaN(day)) return null;
    return new Date(2026, month, day);
  } catch {
    return null;
  }
}

function parseBP(bpStr) {
  if (
    !bpStr ||
    bpStr.trim() === "—" ||
    bpStr.trim() === "-" ||
    bpStr.trim() === ""
  )
    return { systolic: null, diastolic: null };
  const parts = bpStr.trim().split("/");
  if (parts.length !== 2) return { systolic: null, diastolic: null };
  return {
    systolic: parseInt(parts[0], 10) || null,
    diastolic: parseInt(parts[1], 10) || null,
  };
}

function parseNum(val) {
  if (!val || val.trim() === "—" || val.trim() === "-" || val.trim() === "")
    return null;
  const n = parseFloat(val.trim());
  return isNaN(n) ? null : n;
}

function parseBloodSugar(val) {
  if (!val || val.trim() === "—" || val.trim() === "-" || val.trim() === "")
    return null;
  const entries = val
    .split(/\n|;/)
    .map((s) => s.trim())
    .filter(Boolean);
  const results = entries
    .map((entry) => {
      const match = entry.match(/(\d+:\d+\s*[AP]M)\s*--\s*(\d+)(.*)/);
      if (match) {
        return {
          time: match[1].trim(),
          value: parseInt(match[2], 10),
          note: match[3].trim().replace(/^\(|\)$/g, "") || null,
        };
      }
      const numMatch = entry.match(/(\d+)/);
      if (numMatch)
        return { time: "", value: parseInt(numMatch[1], 10), note: null };
      return null;
    })
    .filter(Boolean);
  return results.length ? results : null;
}

export function useHealthData() {
  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Papa.parse(CSV_URL, {
      download: true,
      header: false, // parse as plain arrays so we control which row is the header
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const allRows = results.data;

          // Find the row that contains "Day" and "Date" — that's our real header row
          const headerRowIndex = allRows.findIndex(
            (row) =>
              row.some((cell) => cell.trim() === "Day") &&
              row.some((cell) => cell.trim() === "Date"),
          );

          if (headerRowIndex === -1) {
            console.error(
              "Could not find header row. First 3 rows:",
              allRows.slice(0, 3),
            );
            setError(
              "Could not find header row in CSV. Check console for details.",
            );
            setLoading(false);
            return;
          }

          const headers = allRows[headerRowIndex].map((h) => h.trim());
          const dataRows = allRows.slice(headerRowIndex + 1);

          console.log("Found headers at row", headerRowIndex, ":", headers);
          console.log("Data rows:", dataRows.length);
          console.log("First data row:", dataRows[0]);

          // Map header names to indices
          const idx = (name) =>
            headers.findIndex((h) =>
              h.toLowerCase().includes(name.toLowerCase()),
            );
          const iDay = idx("Day");
          const iDate = idx("Date");
          const iTime = idx("Time");
          const iBP = idx("BP");
          const iPulse = idx("Pulse");
          const iWKg = idx("Weight (kg)");
          const iWLbs = idx("Weight (lbs)");
          const iBS = idx("Blood Sugar");

          console.log("Column indices:", {
            iDay,
            iDate,
            iTime,
            iBP,
            iPulse,
            iWKg,
            iWLbs,
            iBS,
          });

          const parsed = dataRows.map((row, i) => {
            const day = row[iDay] ?? "";
            const dateStr = row[iDate] ?? "";
            const time = row[iTime] ?? "";
            const bpStr = row[iBP] ?? "";
            const pulseStr = row[iPulse] ?? "";
            const wKgStr = iWKg >= 0 ? (row[iWKg] ?? "") : "";
            const wLbsStr = iWLbs >= 0 ? (row[iWLbs] ?? "") : "";
            const bsStr = iBS >= 0 ? (row[iBS] ?? "") : "";

            const date = parseDate(day, dateStr);
            const bp = parseBP(bpStr);

            return {
              id: i,
              day: day.trim(),
              dateStr: dateStr.trim(),
              date,
              time: time.trim(),
              systolic: bp.systolic,
              diastolic: bp.diastolic,
              pulse: parseNum(pulseStr),
              weightKg: parseNum(wKgStr),
              weightLbs: parseNum(wLbsStr),
              bloodSugar: parseBloodSugar(bsStr),
            };
          });

          const valid = parsed.filter((r) => r.date !== null);
          console.log("Valid rows:", valid.length);

          setRawRows(valid);
          setError(null);
        } catch (e) {
          console.error("Parse error:", e);
          setError("Failed to parse data: " + e.message);
        }
        setLoading(false);
      },
      error: (err) => {
        setError("Failed to fetch data: " + err.message);
        setLoading(false);
      },
    });
  }, []);

  return { rawRows, loading, error };
}
