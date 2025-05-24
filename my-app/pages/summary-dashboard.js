import PageHeader from "../components/PageHeader";
import { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ControlBar from "../components/ControlBar";
import cookie from "cookie";
import '../css/summary-dashboard.css';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const COLORS = [
  "#345995",
  "#6DECB9",
  "#F7B801",
  "#F18701",
  "#e75480",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];


function getColumnStats(data, key) {
  const values = data
    .map((row) => row[key])
    .filter((v) => v !== null && v !== undefined && v !== "");
  if (values.length === 0)
    return { mean: "-", min: "-", max: "-", outsideSpec: "-", missing: "100%" };

  const mean = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
  const min = Math.min(...values).toFixed(2);
  const max = Math.max(...values).toFixed(2);

  const lower =
    Math.min(...values) + (Math.max(...values) - Math.min(...values)) * 0.1;
  const upper =
    Math.max(...values) - (Math.max(...values) - Math.min(...values)) * 0.1;
  const outsideSpecCount = values.filter((v) => v < lower || v > upper).length;
  const outsideSpec =
    ((outsideSpecCount / values.length) * 100).toFixed(0) + " %";

  const missing =
    (((data.length - values.length) / data.length) * 100).toFixed(0) + " %";

  return { mean, min, max, outsideSpec, missing };
}

function quantile(sorted, q) {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

function getPieData(data, key) {
  const values = data
    .map((row) => row[key])
    .filter((v) => v !== null && v !== undefined && v !== "")
    .sort((a, b) => a - b);
  if (values.length === 0) return [{ name: "No Data", value: 1 }];
  if (values.length < 4) {
    return values.map((v, i) => ({ name: `Value ${i + 1}: ${v}`, value: 1 }));
  }
  const q1 = quantile(values, 0.25);
  const q2 = quantile(values, 0.5);
  const q3 = quantile(values, 0.75);
  const bins = [0, 0, 0, 0];
  values.forEach((v) => {
    if (v <= q1) bins[0]++;
    else if (v <= q2) bins[1]++;
    else if (v <= q3) bins[2]++;
    else bins[3]++;
  });
  // Defensive: ensure q1/q2/q3 are numbers
  const q1Label = typeof q1 === 'number' && isFinite(q1) ? q1.toFixed(2) : 'N/A';
  const q2Label = typeof q2 === 'number' && isFinite(q2) ? q2.toFixed(2) : 'N/A';
  const q3Label = typeof q3 === 'number' && isFinite(q3) ? q3.toFixed(2) : 'N/A';
  return [
    { name: `≤ Q1 (${q1Label})`, value: bins[0] },
    { name: `Q1-Q2 (${q1Label}-${q2Label})`, value: bins[1] },
    { name: `Q2-Q3 (${q2Label}-${q3Label})`, value: bins[2] },
    { name: `> Q3 (${q3Label})`, value: bins[3] },
  ];
}

function CustomTooltip({ active, payload, stats, col }) {
  if (active && payload && payload.length && payload[0] && payload[0].payload) {
    return (
      <div className="custom-tooltip">
        <div className="tooltip-title">
          {col.toUpperCase()}
        </div>
        <div className="tooltip-item">
          <b>{payload[0].name}</b>: {payload[0].value}
        </div>
        <div className="tooltip-item">
          Mean: <b>{stats.mean}</b>
        </div>
        <div className="tooltip-item">
          Min: <b>{stats.min}</b>
        </div>
        <div className="tooltip-item">
          Max: <b>{stats.max}</b>
        </div>
        <div className="tooltip-item">
          Outside Spec: <b>{stats.outsideSpec}</b>
        </div>
        <div className="tooltip-item">
          Missing Data: <b>{stats.missing}</b>
        </div>
      </div>
    );
  }
  return null;
}

export default function SummaryDashboard() {
  const [mounted, setMounted] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [fullRange, setFullRange] = useState([0, 0]);
  const [exportOpen, setExportOpen] = useState(false);
  const [filterColumn, setFilterColumn] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(0); // seconds
  const [filterApplied, setFilterApplied] = useState(false);
  const [limits, setLimits] = useState({});
  const autoRefreshTimer = useRef(null);

  useEffect(() => {
    setMounted(true);
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
              .filter(Boolean)
              .sort((a, b) => a - b);
            if (timestamps.length) {
              setFullRange([timestamps[0], timestamps[timestamps.length - 1]]);
            }
            setLoading(false);
            return;
          }
        } catch {}
      }
    }
    // If no cache, fetch from API
    fetchData();
    // eslint-disable-next-line
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

  async function fetchData(customRange) {
    setLoading(true);
    let url = `/api/data?limit=1000&offset=0`;
    if (customRange && (customRange.from || customRange.to)) {
      const params = [];
      if (customRange.from) params.push(`timestamp_from=${encodeURIComponent(customRange.from)}`);
      if (customRange.to) params.push(`timestamp_to=${encodeURIComponent(customRange.to)}`);
      url += `&${params.join('&')}`;
    }
    try {
      const res = await fetch(url, { credentials: 'include' });
      const json = await res.json();
      const arr = Array.isArray(json.results) ? json.results : [];
      setData(arr);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sensorDataCache', JSON.stringify(arr));
      }
      if (arr.length) {
        const timestamps = arr
          .map(row => new Date(row.timestamp).getTime())
          .filter(Boolean)
          .sort((a, b) => a - b);
        if (timestamps.length) {
          setFullRange([timestamps[0], timestamps[timestamps.length - 1]]);
        }
      }
      setLoading(false);
    } catch {
      setData([]);
      setLoading(false);
    }
  }

  // Fetch limits from backend
  useEffect(() => {
    fetch("/api/sensor-data-range", { credentials: 'include' })
      .then(res => res.json())
      .then(setLimits)
      .catch(() => setLimits({}));
  }, []);

  useEffect(() => {
    if (!filterApplied) fetchData();
  }, []);

  function handleRefresh() {
    fetchData();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('sensorDataCache');
    }
    setDateRange({ from: '', to: '' });
  }

  function handleDateFilterApply() {
    setFilterApplied(true);
    fetchData(dateRange);
  }

  async function exportPNG() {
    const main = document.querySelector('.summary-grid');
    if (!main) return;
    const canvas = await html2canvas(main, { backgroundColor: null });
    const link = document.createElement('a');
    link.download = 'summary-dashboard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async function exportPDF() {
    const main = document.querySelector('.summary-grid');
    if (!main) return;
    const canvas = await html2canvas(main, { backgroundColor: '#fff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('summary-dashboard.pdf');
  }

  // Filter data by date range and selected column (metric)
  const filteredData = data.filter((row) => {
    if (!row.timestamp) return false;
    const t = new Date(row.timestamp).getTime();
    let inDateRange = true;
    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from).getTime();
      const to = new Date(dateRange.to).getTime();
      inDateRange = t >= from && t <= to;
    }
    if ((dateRange.from && !dateRange.to) || (!dateRange.from && dateRange.to)) {
      inDateRange = false;
    }
    const columnOk = filterColumn
      ? row[filterColumn] !== undefined &&
        row[filterColumn] !== null &&
        row[filterColumn] !== ""
      : true;
    return inDateRange && columnOk;
  });

  const COLUMN_LABELS = Object.keys(data[0] || {})
    .filter(k => k !== "timestamp" && k !== "factory" && k !== "id" && k !== "topic_id")
    .reduce((acc, k) => {
      acc[k] = k.toUpperCase();
      return acc;
    }, {});

  const columns = Object.keys(data[0] || {})
    .filter(key => key !== "timestamp" && key !== "factory" && key !== "id" && key !== "topic_id" && (!filterColumn || key === filterColumn)
  );

  return (
    <div className="summary-dashboard-bg">
      <div className="summary-dashboard-header">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <PageHeader title="Summary Dashboard" />
        </div>
      </div>
      {mounted && (
        <>
          <ControlBar
            exportOpen={exportOpen}
            setExportOpen={setExportOpen}
            exportCSV={exportPNG}
            exportJSON={exportPDF}
            exportLabelCSV="Export as Image"
            exportLabelJSON="Export as PDF"
            dateRange={dateRange}
            handleDateChange={(e) => {
              const { name, value } = e.target;
              setDateRange(prev => ({ ...prev, [name]: value }));
            }}
            onDateFilterApply={handleDateFilterApply}
            filterMetric={filterColumn}
            setFilterMetric={setFilterColumn}
            COLUMN_LABELS={COLUMN_LABELS}
            handleRefresh={handleRefresh}
            loading={loading}
            autoRefreshInterval={autoRefreshInterval}
            onAutoRefreshChange={setAutoRefreshInterval}
          />
          <div className="summary-grid">
            {columns.map((col, idx) => {
              const stats = getColumnStats(filteredData, col);
              const pieData = getPieData(filteredData, col);
              const limit = limits[col];
              return (
                <div key={col} className="summary-card">
                  <div className="summary-card-title">{col.toUpperCase()}</div>
                  <div className="summary-chart-container">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                          isAnimationActive={true}
                          animationDuration={900}
                        >
                          {pieData.map((entry, i) => (
                            <Cell
                              key={`cell-${i}`}
                              fill={COLORS[i % COLORS.length]}
                              style={{ cursor: "pointer", transition: "filter 0.2s" }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={(props) => <CustomTooltip {...props} stats={stats} col={col} />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="summary-stats">
                    <div><b>Mean:</b> {stats.mean}</div>
                    <div><b>Min:</b> {stats.min}</div>
                    <div><b>Max:</b> {stats.max}</div>
                    <div><b>Outside Spec:</b> {stats.outsideSpec}</div>
                    <div><b>Missing Data:</b> {stats.missing}</div>
                    {limit && (
                      <>
                        <div><b>Limit Min:</b> {limit.min}</div>
                        <div><b>Limit Max:</b> {limit.max}</div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {!filteredData.length && (
        <div className="summary-empty">
          {loading
            ? "Loading..."
            : "No data to display. Please select a date range or adjust filters."}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps = async ({ req }) => {
  const cookies = cookie.parse(req.headers.cookie || "");
  const accessToken = cookies.accessToken || null;
  console.info("Access Token from cookie: ", accessToken);
  if (!accessToken) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  return { props: {} };
};