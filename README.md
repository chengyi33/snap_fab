# SnapFab — Fab Process Tracker

Local intranet web app for tracking cleanroom fab process schedules, tool bookings, and team assignments.

## Quick Start

```bash
npm install
npm run dev
```

Then open:
- **Local:** http://localhost:5173
- **Network (team):** http://\<your-ip\>:5173

## Production (single server)

```bash
npm run build   # builds React into client/dist
npm start       # serves everything from port 3000
```

Then share `http://<your-ip>:3000` with the team.

## Data

All data is stored as JSON files in `server/data/`. First run auto-seeds sample data.

To reset: delete files in `server/data/`.

## Features

- 📊 **Dashboard** — weekly layer status, operator load, at-risk items
- 🔧 **Tool Bookings** — log and track UCSB tool bookings
- 📋 **POR Editor** — edit process times and slot lengths per layer; import from Excel
- 📅 **Schedule** — master schedule timeline with per-layer duration sliders
- 👥 **Team** — member assignments, trained tools, workload

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: JSON files (via `server/data/`)
- Excel parsing: `xlsx`
