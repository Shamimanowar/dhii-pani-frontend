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
import cookie from "cookie";
import '../css/graphical-dashboard.css';

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

// Helper for formatting time for Brush and XAxis
function timeTickFormatter(str) {
  if (!str) return "";
  // Try to format ISO or YYYY-MM-DDTHH:mm:ssZ to 'MM-DD HH:mm'
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${mm}-${dd} ${hh}:${min}`;
  }
  // fallback: try to split if space exists
  const parts = str.split(" ");
  if (parts.length === 2) {
    const [date, time] = parts;
    return `${date.slice(5)} ${time.slice(0, 5)}`;
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

  // Fetch data from /api/data.js (same as data-table.js)
  useEffect(() => {
    setLoading(true);
    fetch("/api/data?limit=1000&offset=0", { credentials: 'include' })
      .then(res => res.json())
      .then(json => {
        const mapped = Array.isArray(json.results)
          ? json.results.map(row => ({
              time: row.timestamp,
              temp: row.temperature,
              bod: row.bod,
              cod: row.cod,
              ph: row.ph,
              tds: row.tds,
              do: row.do,
              color: row.color,
              tss: row.tss
            }))
          : [];
        setData(mapped);
        // Set full date range
        if (mapped.length) {
          const timestamps = mapped
            .map(row => new Date(row.time).getTime())
            .filter(Boolean)
            .sort((a, b) => a - b);
          if (timestamps.length) {
            setFullRange([timestamps[0], timestamps[timestamps.length - 1]]);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleRefresh() {
    setLoading(true);
    fetch("/api/data?limit=1000&offset=0", { credentials: 'include' })
      .then(res => res.json())
      .then(json => {
        const mapped = Array.isArray(json.results)
          ? json.results.map(row => ({
              time: row.timestamp,
              temp: row.temperature,
              bod: row.bod,
              cod: row.cod,
              ph: row.ph,
              tds: row.tds,
              do: row.do,
              color: row.color,
              tss: row.tss
            }))
          : [];
        setData(mapped);
        // Set full date range
        if (mapped.length) {
          const timestamps = mapped
            .map(row => new Date(row.time).getTime())
            .filter(Boolean)
            .sort((a, b) => a - b);
          if (timestamps.length) {
            setFullRange([timestamps[0], timestamps[timestamps.length - 1]]);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setLoading(false);
      });
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
        <div key={metric} className="card">
          <div className="card-title">{label}</div>
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
              <XAxis dataKey="time" tick={{ fontSize: 12 }} minTickGap={8} tickFormatter={timeTickFormatter} />
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
        <div key={metric} className="card">
          <div className="card-title">{label}</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} minTickGap={8} tickFormatter={timeTickFormatter} />
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
      <div key={metric} className="card">
        <div className="card-title">{label}</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} minTickGap={8} tickFormatter={timeTickFormatter} />
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
    <div className="graphical-dashboard-bg">
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
      {/* Main caller */}
      {mounted && (
        <div className="graphical-dashboard-main">
          {metrics.map((metric, idx) => renderChart(metric, idx))}
        </div>
      )}
      {!filteredData.length && (
        <div className="no-data-message">
          {loading
            ? "Loading..."
            : "No data to display. Please select a date range."}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps = async ({ req }) => {
  const cookies = cookie.parse(req.headers.cookie || "");
  const accessToken = cookies.accessToken || null;
  // console.info("Access Token from cookie: ", accessToken);
  if (!accessToken) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  return { props: {} };
};