import PageHeader from "../components/PageHeader";
import { useEffect, useState, useRef } from "react";
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
import * as cookie from "cookie";
import '../css/graphical-dashboard.css';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Main GraphicalDashboard page for visualizing sensor data from the backend API only.
// All charts and graphs are rendered using API data—no Google Sheets or mock data remains.
// Extensive comments provided to clarify logic and design for future maintainers.

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
  temperature: "Temperature (°C)",
  bod: "BOD",
  cod: "COD",
  ph: "pH",
  tds: "TDS",
  do: "DO",
  color: "COLOR",
  tss: "TSS",
};


// Helper for formatting time for Brush
function brushTickFormatter(str) {
  if (!str) return "";
  if (typeof str !== 'string') str = String(str);
  const parts = str.split(" ");
  if (parts.length === 2) {
    const [date, time] = parts;
    return `${date.slice(5)} ${time.slice(0, 5)}`; // MM-DD HH:mm
  }
  return str;
}

// Helper for formatting time for Brush and XAxis
function timeTickFormatter(str, index) {
  if (!str) return "";
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  if (index === 0) {
    return `${mm}.${dd} ${hours}:${minutes}`;
  }
  return `${hours}:${minutes}`;
}

// Helper to get the API endpoint from environment variable (for client-side fetches to Next.js API routes)
const API_DATA_ROUTE = "/api/data";
const API_LIMITS_ROUTE = "/api/sensor-data-range";

export default function GraphicalDashboard() {
  // State variables:
  // - mounted: tracks if component is mounted (for SSR/CSR issues)
  // - data: stores fetched sensor data
  // - loading: indicates if data is being loaded
  // - exportOpen: controls export modal visibility
  // - autoRefreshInterval: interval (seconds) for auto-refresh
  // - autoRefreshTimer: ref for managing auto-refresh timer
  // - limits: stores API-provided or default value limits for chart reference lines
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(0); // seconds
  const autoRefreshTimer = useRef(null);
  const [limits, setLimits] = useState({});

  // Date range state - start blank
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [fullRange, setFullRange] = useState([0, 0]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterMetric, setFilterMetric] = useState("");
  const [filterApplied, setFilterApplied] = useState(false);

  // Fetches all sensor data from the backend API, optionally filtered by date range.
  async function fetchData(customRange) {
    setLoading(true);
    let url = `${API_DATA_ROUTE}?limit=100&offset=0`;
    if (customRange && (customRange.from || customRange.to)) {
      const params = [];
      if (customRange.from) params.push(`timestamp_from=${encodeURIComponent(customRange.from)}`);
      if (customRange.to) params.push(`timestamp_to=${encodeURIComponent(customRange.to)}`);
      url += `&${params.join('&')}`;
    }
    try {
      // Fetch data from Next.js API route, which proxies to backend using env var
      const res = await fetch(url, { credentials: 'include' });
      const json = await res.json();
      setData(Array.isArray(json.results) ? json.results : []);
      // Optionally, store in sessionStorage for reuse
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sensorDataCache', JSON.stringify(Array.isArray(json.results) ? json.results : []));
      }
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  // Fetch data from /api/data.js (same as data-table.js)
  useEffect(() => {
    // Try to load from sessionStorage first
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('sensorDataCache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setData(parsed);
            const timestamps = parsed
              .map(row => new Date(row.timestamp).getTime())
              .filter(Boolean);
            if (timestamps.length) {
              setFullRange([timestamps[0], timestamps[timestamps.length - 1]]);
            }
            setLoading(false);
            return;
          }
        } catch { }
      }
    }
    // If no cache, fetch from API
    setLoading(true);
    fetch(API_DATA_ROUTE + "?limit=100&offset=0", { credentials: 'include' })
      .then(res => res.json())
      .then(json => {
        const arr = Array.isArray(json.results) ? json.results : [];
        setData(arr);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('sensorDataCache', JSON.stringify(arr));
        }
        if (arr.length) {
          const timestamps = arr
            .map(row => new Date(row.timestamp).getTime())
            .filter(Boolean);
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

  // Fetch limits from backend
  useEffect(() => {
    fetch(API_LIMITS_ROUTE, { credentials: 'include' })
      .then(res => res.json())
      .then(setLimits)
      .catch(() => setLimits({}));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (autoRefreshTimer.current) clearInterval(autoRefreshTimer.current);
    if (autoRefreshInterval > 0) {
      autoRefreshTimer.current = setInterval(() => {
        fetchData();
      }, autoRefreshInterval * 1000);
    }
    return () => {
      if (autoRefreshTimer.current) clearInterval(autoRefreshTimer.current);
    };
  }, [autoRefreshInterval]);

  function handleRefresh() {
    setLoading(true);
    fetch(API_DATA_ROUTE + "?limit=100&offset=0", { credentials: 'include' })
      .then(res => res.json())
      .then(json => {
        const arr = Array.isArray(json.results) ? json.results : [];
        setData(arr);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('sensorDataCache', JSON.stringify(arr));
        }
        if (arr.length) {
          const timestamps = arr
            .map(row => new Date(row.timestamp).getTime())
            .filter(Boolean);
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

  function handleDateFilterApply() {
    setFilterApplied(true);
    fetchData(dateRange);
  }

  // Export helpers
  async function exportPNG() {
    const main = document.querySelector('.graphical-dashboard-download-body');
    if (!main) return;
    const canvas = await html2canvas(main, { backgroundColor: null });
    const link = document.createElement('a');

    const date = new Date();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedDate = `${date.toISOString().slice(0, 10).replace(/-/g, '_')}.${hours}.${minutes}`;

    link.download = `graphical-dashboard-${formattedDate}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async function exportPDF() {
    const main = document.querySelector('.graphical-dashboard-download-body');
    if (!main) return;
    const canvas = await html2canvas(main, { backgroundColor: '#fff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

    const date = new Date();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedDate = `${date.toISOString().slice(0, 10).replace(/-/g, '_')}.${hours}.${minutes}`;

    pdf.save(`graphical-dashboard-${formattedDate}.pdf`);
  }

  // Only show the selected metric, or all if none selected
  const metrics = Object.keys(COLUMN_LABELS).filter(
    (m) => !filterMetric || m === filterMetric
  );
  const isSingleMetric = metrics.length === 1;

  // Reverse data so most recent is on the right
  const displayData = Array.isArray(data) ? [...data].reverse() : [];

  // Helper to render a modern card for each metric
  function renderChart(metric, idx) {
    if (!displayData.length) return null;
    const color = COLORS[idx % COLORS.length];
    const label = COLUMN_LABELS[metric] || metric.toUpperCase();
    const limit = limits[metric];

    // Helper for YAxis domain
    // const yDomain = limit && limit.min !== undefined && limit.max !== undefined
    //   ? [Math.min(limit.min, limit.max), Math.max(limit.min, limit.max)]
    //   : ["auto", "auto"];
    const yDomain = ["auto", "auto"];

    if (metric === "tds") {
      return (
        <div key={metric} className="card">
          <div className="card-title">{label}</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={displayData}
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
              <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} minTickGap={8} tickFormatter={timeTickFormatter} />
              <YAxis domain={yDomain} />
              <Tooltip />
              <Legend />
              {limit && (
                <ReferenceLine
                  y={limit.max}
                  label="Upper"
                  stroke="#222"
                  strokeDasharray="3 3"
                />
              )}
              {limit && (
                <ReferenceLine
                  y={limit.min}
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
                dataKey="timestamp"
                height={20}
                stroke={color}
                tickFormatter={brushTickFormatter}
              />
            </AreaChart>
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
            data={displayData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} minTickGap={8} tickFormatter={timeTickFormatter} />
            <YAxis domain={yDomain} />
            <Tooltip />
            <Legend />
            {limit && (
              <ReferenceLine
                y={limit.max}
                label="Upper"
                stroke="#222"
                strokeDasharray="3 3"
              />
            )}
            {limit && (
              <ReferenceLine
                y={limit.min}
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
              dataKey="timestamp"
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
        exportCSV={exportPNG}
        exportJSON={exportPDF}
        exportLabelCSV="Export as Image"
        exportLabelJSON="Export as PDF"
        dateRange={dateRange}
        fullRange={fullRange}
        handleDateChange={(e) => {
          const { name, value } = e.target;
          setDateRange(prev => ({ ...prev, [name]: value }));
        }}
        onDateFilterApply={handleDateFilterApply}
        filterMetric={filterMetric}
        setFilterMetric={setFilterMetric}
        COLUMN_LABELS={COLUMN_LABELS}
        handleRefresh={handleRefresh}
        loading={loading}
        autoRefreshInterval={autoRefreshInterval}
        onAutoRefreshChange={setAutoRefreshInterval}
      />
      {/* Main caller */}
      {mounted && (
        <div className="graphical-dashboard-download-body">
          <div className={`graphical-dashboard-main${isSingleMetric ? ' single-metric' : ''}`}>
            {metrics.map((metric, idx) => renderChart(metric, idx))}
          </div>
          {/* Show time range for the data displayed */}
          {Array.isArray(data) && data.length > 0 && (() => {
            // Find true min and max timestamps in data
            const timestamps = data
              .map(row => new Date(row.timestamp).getTime())
              .filter(Boolean)
              .sort((a, b) => a - b);
            if (timestamps.length) {
              const minTime = new Date(timestamps[0]).toLocaleString();
              const maxTime = new Date(timestamps[timestamps.length - 1]).toLocaleString();
              return (
                <div style={{
                  textAlign: 'center',
                  fontSize: 16,
                  color: '#4f3ca7',
                  fontWeight: 600,
                  margin: '12px 0 8px 0',
                  letterSpacing: 0.2,
                }}>
                  Data Time Range: <span style={{ color: '#1f3ca7', fontWeight: 700 }}>{minTime} — {maxTime}</span>
                </div>
              );
            }
            return null;
          })()}
        </div>


      )}
      {!data.length && (
        <div className="no-data-message">
          {loading
            ? "Loading..."
            : "No data to display. Please select a date range."}
        </div>
      )}

      {/* Show total number of data points used for pie charts */}
      <div style={{
        marginTop: 12,
        textAlign: 'center',
        fontSize: 18,
        color: '#345995',
        fontWeight: 600,
        letterSpacing: 0.5,
        background: '#f7fafd',
        borderRadius: 12,
        padding: '12px 0',
        boxShadow: '0 2px 8px 0 #e6e6e6',
        maxWidth: 340,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        Total data points: <span style={{ color: '#222', fontWeight: 700 }}>{data.length}</span>
      </div>
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