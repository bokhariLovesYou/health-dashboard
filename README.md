# Health Dashboard — Amjad Bukhari

A React + Vite dashboard for tracking blood pressure, heart rate, weight, and blood sugar from a public Google Sheet.

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Build for Production

```bash
npm run build
npm run preview
```

## Features

- 📊 **Blood Pressure chart** — daily avg systolic & diastolic with normal range reference lines
- 💓 **Heart Rate chart** — daily avg, min & max pulse
- ⚖️ **Weight trend** — line chart with kg/lbs toggle and a full insights panel (total change, rate/week, min, max, avg)
- 🩸 **Blood Sugar** — scatter plot with color-coded ranges (normal / elevated / high)
- 📋 **Data table** — all readings with BP classification badges
- 🌙 **Light / Dark mode** toggle
- 📅 **Date range filter** — Last 7d / 14d / 30d / All time
- 🔄 **Live data** — fetches fresh CSV from Google Sheets on every load

## Google Sheet Setup

The app fetches data from:
```
https://docs.google.com/spreadsheets/d/10Zj_kRQs5uV5e5T4fOHkgb1PiSQ6XmNH70vV4SM-oQY/export?format=csv&gid=0
```

**Make sure your sheet is public:**
1. Open the Google Sheet
2. File → Share → Publish to web
3. Choose "Comma-separated values (.csv)" and publish
4. The sheet must also be shared as "Anyone with the link can view"

## Expected Column Names

| Column | Example |
|---|---|
| Day | Mon |
| Date | 18-Feb |
| Time | 8:30 AM |
| BP (mmHg) | 120/66 |
| Pulse | 71 |
| Weight (kg) | 74.55 |
| Weight (lbs) | 164.35 |
| Blood Sugar | 8:35 AM -- 125 |

Blood sugar entries support notes: `7:37 PM -- 185 (1 hour after dinner)`

## Stack

- **React 18** + **Vite 5**
- **Tailwind CSS v3** + **shadcn/ui** component patterns
- **Recharts** for all charts
- **PapaParse** for CSV parsing
- **date-fns** for date utilities
- **lucide-react** for icons
