import PageHeader from "../components/PageHeader";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  AreaChart,
  Area,
  Brush,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import ControlBar from "../components/ControlBar";

const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTpUL4EZZPzXJDgjqKncdHpPk9G0-fwGZYepx5cJvW5OAgeGUbVkmQ-kBTYCvqlNz6Za8RYMFxD5B2T/pub?gid=1991120722&single=true&output=csv";

const COLORS = [
  "#e75480",
  "#764ba2",
  "#667eea",
  "#4f3ca7",
  "#00b894",
  "#fdcb6e",
  "#0984e3",
  "#d63031",
  "#636e72",
];

const COLUMN_LABELS = {
  temp: "Temperature (°C)",
  bod: "BOD",
  cod: "COD",
  ph: "pH",
  tds: "TDS",
  do: "DO",
  color: "COLOR",
  tss: "TSS",
};

const LIMITS = {
  temp: { upper: 32.04, lower: 31.93 },
  tds: { upper: 2500, lower: 0 },
  bod: { upper: 10, lower: 0 },
  cod: { upper: 50, lower: 0 },
  ph: { upper: 8, lower: 6 },
  do: { upper: 10, lower: 4 },
  chroma: { upper: 20, lower: 0 },
  tss: { upper: 50, lower: 0 },
};

// Helper for formatting time for Brush
function brushTickFormatter(str) {
  if (!str) return "";
  const parts = str.split(" ");
  if (parts.length === 2) {
    const [date, time] = parts;
    return `${date.slice(5)} ${time.slice(0, 5)}`; // MM-DD HH:mm
  }
  return str;
}

export default function GraphicalDashboard() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  // Date range state - start blank
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [fullRange, setFullRange] = useState([0, 0]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterMetric, setFilterMetric] = useState("");

  // Fetch data function (used for both mount and refresh)
  function fetchData() {
    setLoading(true);
    fetch(GOOGLE_SHEET_CSV_URL)
      .then((res) => (res.ok ? res.text() : Promise.reject()))
      .then((csv) => {
        const [header, ...rows] = csv.trim().split("\n");
        const keys = header.split(",").map((k) => k.trim().toLowerCase());
        const parsed = rows
          .map((row) => {
            const vals = row.split(",");
            return Object.fromEntries(
              vals.map((v, i) => [
                keys[i],
                isNaN(Number(v)) || v.trim() === "" ? v : Number(v),
              ])
            );
          })
          .filter((row) => row.time);
        setData(parsed);

        // Set full date range but leave dateRange blank
        const timestamps = parsed
          .map((row) => new Date(row.time).getTime())
          .filter(Boolean)
          .sort((a, b) => a - b);
        if (timestamps.length) {
          setFullRange([timestamps[0], timestamps[timestamps.length - 1]]);
        }
        setLoading(false);
      })
      .catch(() => setData([]));
  }

  useEffect(() => {
    setMounted(true);
    fetchData();
    // eslint-disable-next-line
  }, []);

  function handleRefresh() {
    fetchData();
    setDateRange({ from: "", to: "" }); // Clear date fields on refresh
  }

  function handleDateChange(e) {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  }

  // Export helpers
  function exportCSV() {
    if (!filteredData.length) return;
    const keys = Object.keys(filteredData[0]);
    const csvRows = [
      keys.join(","),
      ...filteredData.map((row) =>
        keys.map((k) => `"${row[k] ?? ""}"`).join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graphical-dashboard.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function exportJSON() {
    if (!filteredData.length) return;
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graphical-dashboard.json";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Filter data by date range and filter metric
  const filteredData = data
    .filter((row) => {
      if (!row.time) return false;
      const t = new Date(row.time).getTime();
      // If both date fields are blank, show all data
      let inDateRange = true;
      if (dateRange.from && dateRange.to) {
        const from = new Date(dateRange.from).getTime();
        const to = new Date(dateRange.to).getTime();
        inDateRange = t >= from && t <= to;
      }
      // If only one is set, don't show any data until both are set (optional: comment out to allow partial filter)
      if (
        (dateRange.from && !dateRange.to) ||
        (!dateRange.from && dateRange.to)
      ) {
        inDateRange = false;
      }
      const metricOk = filterMetric
        ? row[filterMetric] !== undefined &&
          row[filterMetric] !== null &&
          row[filterMetric] !== ""
        : true;
      return inDateRange && metricOk;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") return a.time.localeCompare(b.time);
      return b.time.localeCompare(a.time);
    });

  // Only show the selected metric, or all if none selected
  const metrics = Object.keys(COLUMN_LABELS).filter(
    (m) => !filterMetric || m === filterMetric
  );

  // Helper to render a modern card for each metric
  function renderChart(metric, idx) {
    if (!filteredData.length) return null;
    const color = COLORS[idx % COLORS.length];
    const label = COLUMN_LABELS[metric] || metric.toUpperCase();
    const limits = LIMITS[metric];

    if (metric === "tds") {
      return (
        <div key={metric} style={cardStyle}>
          <div style={cardTitleStyle}>{label}</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={`color${metric}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} minTickGap={24} />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip />
              <Legend />
              {limits && (
                <ReferenceLine
                  y={limits.upper}
                  label="Upper"
                  stroke="#222"
                  strokeDasharray="3 3"
                />
              )}
              {limits && (
                <ReferenceLine
                  y={limits.lower}
                  label="Lower"
                  stroke="#222"
                  strokeDasharray="3 3"
                />
              )}
              <Area
                type="monotone"
                dataKey={metric}
                stroke={color}
                fill={`url(#color${metric})`}
                fillOpacity={0.5}
                dot={false}
              />
              <Brush
                dataKey="time"
                height={20}
                stroke={color}
                tickFormatter={brushTickFormatter}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }
    if (metric === "tss") {
      return (
        <div key={metric} style={cardStyle}>
          <div style={cardTitleStyle}>{label}</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} minTickGap={24} />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip />
              <Legend />
              {limits && (
                <ReferenceLine
                  y={limits.upper}
                  label="Upper"
                  stroke="#222"
                  strokeDasharray="3 3"
                />
              )}
              {limits && (
                <ReferenceLine
                  y={limits.lower}
                  label="Lower"
                  stroke="#222"
                  strokeDasharray="3 3"
                />
              )}
              <Bar dataKey={metric} fill={color} />
              <Brush
                dataKey="time"
                height={20}
                stroke={color}
                tickFormatter={brushTickFormatter}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    // Default: LineChart
    return (
      <div key={metric} style={cardStyle}>
        <div style={cardTitleStyle}>{label}</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip />
            <Legend />
            {limits && (
              <ReferenceLine
                y={limits.upper}
                label="Upper"
                stroke="#222"
                strokeDasharray="3 3"
              />
            )}
            {limits && (
              <ReferenceLine
                y={limits.lower}
                label="Lower"
                stroke="#222"
                strokeDasharray="3 3"
              />
            )}
            <Line
              type="monotone"
              dataKey={metric}
              stroke={color}
              strokeWidth={2}
              dot={false}
              fill="none"
            />
            <Brush
              dataKey="time"
              height={20}
              stroke={color}
              tickFormatter={brushTickFormatter}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // The main component return
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f7f8fa 0%, #e3e6f3 100%)",
        padding: 0,
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
      }}
    >
      <PageHeader title="Graphical Dashboard" />
      {/* Modern controls bar */}
      <ControlBar
        exportOpen={exportOpen}
        setExportOpen={setExportOpen}
        exportCSV={exportCSV}
        exportJSON={exportJSON}
        dateRange={dateRange}
        fullRange={fullRange}
        handleDateChange={handleDateChange}
        filterMetric={filterMetric}
        setFilterMetric={setFilterMetric}
        COLUMN_LABELS={COLUMN_LABELS}
        handleRefresh={handleRefresh}
        loading={loading}
      />
      <style>{`
        .dt-refresh-anim {
          animation: dtSpin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes dtSpin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {/* Main caller */}
      {mounted && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
            gap: 36,
            marginTop: 80,
            marginLeft: 40,
            marginRight: 40,
            marginBottom: 40,
          }}
        >
          {metrics.map((metric, idx) => renderChart(metric, idx))}
        </div>
      )}
      {!filteredData.length && (
        <div
          style={{
            textAlign: "center",
            color: "#6c63ff",
            fontWeight: 600,
            fontSize: 22,
            marginTop: 80,
            opacity: 0.8,
            letterSpacing: 1,
          }}
        >
          {loading
            ? "Loading..."
            : "No data to display. Please select a date range."}
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  background: "linear-gradient(120deg, #fff 60%, #f7f8fa 100%)",
  borderRadius: 18,
  boxShadow: "0 8px 32px #6c63ff18",
  padding: "24px 18px 12px 18px",
  minWidth: 0,
  minHeight: 340,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  marginBottom: 8,
  border: "1.5px solid #ececff",
};

const cardTitleStyle = {
  fontWeight: 700,
  fontSize: 20,
  marginBottom: 12,
  color: "#6c63ff",
  letterSpacing: 1,
};