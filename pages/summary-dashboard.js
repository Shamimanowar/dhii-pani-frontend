import PageHeader from "../components/PageHeader";
import { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ControlBar from "../components/ControlBar";
import * as cookie from "cookie";
import '../css/summary-dashboard.css';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Main SummaryDashboard page for showing summary stats and pie charts from backend API data only.
// All calculations and visualizations are based on API data—no Google Sheets or mock data remains.
// Comments provided to clarify logic and design for future maintainers.

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

const PIE_COLORS = [
  "#4CAF50", // green for matched (in range)
  "#F44336", // red for outside range
  "#222",    // blackish for missing
];

// Helper to get the API endpoint from environment variable (for client-side fetches to Next.js API routes)
const API_DATA_ROUTE = "/api/data";
const API_LIMITS_ROUTE = "/api/sensor-data-range";

// getColumnStats: Computes summary statistics (mean, avg, min, max, out-of-spec %, missing %) for a given column.
// - Only numeric, non-missing values are included in calculations.
// - 'avg' is shown as an alias for 'mean' for clarity.
// - Out-of-spec and missing percentages are calculated relative to total data count.
function getColumnStats(data, key, limit) {
  const values = data
    .map((row) => {
      let v = row[key];
      if (typeof v === 'string' && v.trim() !== '') v = Number(v);
      return v;
    })
    .filter((v) => v !== null && v !== undefined && v !== '' && !isNaN(v));
  // sanity check is done

  if (values.length === 0)
    return { avg: '-', min: '-', max: '-', outsideSpec: '-', missing: '100%', outOfRangeCount: 0, inRangeCount: 0 };

  // Only calculate avg, min, max using non-missing values
  const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
  const min = Math.min(...values).toFixed(2);
  const max = Math.max(...values).toFixed(2);

  let outOfRangeCount = 0;
  let inRangeCount = 0;
  if (limit && typeof limit.min === 'number' && typeof limit.max === 'number') {
    values.forEach(v => {
      if (v < limit.min || v > limit.max) outOfRangeCount++;
      else inRangeCount++;
    });
  } else {
    inRangeCount = values.length;
  }
  const outsideSpec = data.length > 0 ? ((outOfRangeCount / data.length) * 100).toFixed(0) + ' %' : '-';
  const missing = data.length > 0 ? (((data.length - values.length) / data.length) * 100).toFixed(0) + ' %' : '-';

  return { avg, min, max, outsideSpec, missing, outOfRangeCount, inRangeCount };
}

// getPieData: Prepares data for the pie chart legend and chart.
// - Counts in-range, out-of-range, and missing values for a given column.
// - Used to render color-coded pie chart and legend.
function getPieData(data, key, limit) {
  let inRange = 0, outOfRange = 0, missing = 0;
  data.forEach(row => {
    let v = row[key];
    // Always treat empty string, null, undefined, or NaN as missing for ALL columns (including temperature)
    if (typeof v === 'string' && v.trim() !== '') v = Number(v);
    const isMissing = v === null || v === undefined || v === '' || isNaN(v);
    if (isMissing) {
      missing++;
    } else if (
      limit && typeof limit.min === 'number' && typeof limit.max === 'number' &&
      (v < limit.min || v > limit.max)
    ) {
      outOfRange++;
    } else {
      inRange++;
    }
  });
  return [
    { name: 'Matched (In Range', value: inRange },
    { name: 'Outside Range', value: outOfRange },
    { name: 'Missing', value: missing },
  ];
}

// CustomTooltip: Renders a detailed tooltip for the pie chart, showing counts and percentages for each category.
// - Ensures tooltip content is clear and color-coded to match the legend.
function CustomTooltip({ active, payload, stats, col }) {
  if (active && payload && payload.length && payload[0] && payload[0].payload) {
    // Calculate total for percentage
    const missingCount = (typeof stats.missing === 'string' && stats.missing.endsWith('%'))
      ? Math.round((parseFloat(stats.missing) / 100) * (stats.inRangeCount + stats.outOfRangeCount + Math.round((parseFloat(stats.missing) / 100) * (stats.inRangeCount + stats.outOfRangeCount))))
      : (stats.missing || 0);
    const totalCount = stats.inRangeCount + stats.outOfRangeCount + missingCount;
    const percent = (count) => totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) + '%' : '0%';
    return (
      <div className="custom-tooltip">
        <div className="tooltip-title">{col.toUpperCase()}</div>
        <div className="tooltip-item"><span style={{ color: PIE_COLORS[0] }}><b>In Range:</b></span> {stats.inRangeCount} ({percent(stats.inRangeCount)})</div>
        <div className="tooltip-item"><span style={{ color: PIE_COLORS[1] }}><b>Out of Spec:</b></span> {stats.outOfRangeCount} ({percent(stats.outOfRangeCount)})</div>
        <div className="tooltip-item"><span style={{ color: PIE_COLORS[2] }}><b>Missing:</b></span> {missingCount} ({percent(missingCount)})</div>
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
        } catch { }
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
    fetch(API_LIMITS_ROUTE, { credentials: 'include' })
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

  // Handle date filter application to fetch data within the specified range
  function handleDateFilterApply() {
    setFilterApplied(true);
    fetchData(dateRange);
  }

  async function exportPNG() {
    const main = document.querySelector('.summary-dashboard-description');
    if (!main) return;
    const canvas = await html2canvas(main, { backgroundColor: null });
    const link = document.createElement('a');

    const date = new Date();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedDate = `${date.toISOString().slice(0, 10).replace(/-/g, '_')}.${hours}.${minutes}`;

    link.download = `summary-dashboard-${formattedDate}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async function exportPDF() {
    const main = document.querySelector('.summary-dashboard-description');
    if (!main) return;
    const canvas = await html2canvas(main, { backgroundColor: '#fff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

    const date = new Date();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedDate = `${date.toISOString().slice(0, 10).replace(/-/g, '_')}.${hours}.${minutes}`;

    pdf.save(`summary-dashboard-${formattedDate}.pdf`);
  }

  // Filter data by date range and selected column (metric)
  // FIX: Only filter when both from and to are set, so missing data is included in pie chart
  const filteredData = data.filter((row) => {
    if (!row.timestamp) return false;
    const t = new Date(row.timestamp).getTime();
    let inDateRange = true;
    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from).getTime();
      const to = new Date(dateRange.to).getTime();
      inDateRange = t >= from && t <= to;
    }
    // If only one of from/to is set, do not filter by date
    // Do NOT filter by column value here, so missing data is included in pie chart
    return inDateRange;
  });

  // Calculate time range for filteredData
  let minTime = null, maxTime = null;
  if (filteredData.length > 0) {
    // Find true min and max timestamps in filteredData
    const timestamps = filteredData
      .map(row => new Date(row.timestamp).getTime())
      .filter(Boolean)
      .sort((a, b) => a - b);
    if (timestamps.length) {
      minTime = new Date(timestamps[0]).toISOString();
      maxTime = new Date(timestamps[timestamps.length - 1]).toISOString();
    }
  }



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
          <div className="summary-dashboard-description">
            <div className="summary-grid">
              {columns.map((col, idx) => {
                const stats = getColumnStats(filteredData, col, limits[col]);
                const limit = limits[col];
                const pieData = getPieData(filteredData, col, limit);
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
                                fill={PIE_COLORS[i]}
                                style={{ cursor: "pointer", transition: "filter 0.2s" }}
                              />
                            ))}
                          </Pie>

                          <Tooltip content={(props) => <CustomTooltip {...props} stats={stats} col={col} />} />
                          {/* Mark out-of-range area visually on the pie chart legend */}
                          <g className="pie-legend" transform="translate(0,200)" style={{ marginTop: 45 }}>
                            <rect x="0" y="0" width="18" height="18" fill={PIE_COLORS[0]} />
                            <text x="24" y="14" fontSize="14">Matched</text>
                            <rect x="90" y="0" width="18" height="18" fill={PIE_COLORS[1]} />
                            <text x="114" y="14" fontSize="14">Outside Range</text>
                            <rect x="220" y="0" width="18" height="18" fill={PIE_COLORS[2]} />
                            <text x="245" y="14" fontSize="14">Missing</text>
                          </g>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Add always-visible summary of pie chart stats for export */}
                    <div className="summary-pie-stats" style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 16,
                      margin: '8px 0 0 0',
                      fontSize: 14,
                      fontWeight: 500,
                    }}>
                      <span style={{ color: PIE_COLORS[0] }}>
                        In Range: {stats.inRangeCount} ({filteredData.length > 0 ? ((stats.inRangeCount / filteredData.length) * 100).toFixed(1) : '0'}%)
                      </span>
                      <span style={{ color: PIE_COLORS[1] }}>
                        Out of Spec: {stats.outOfRangeCount} ({filteredData.length > 0 ? ((stats.outOfRangeCount / filteredData.length) * 100).toFixed(1) : '0'}%)
                      </span>
                      <span style={{ color: PIE_COLORS[2] }}>
                        Missing: {pieData[2].value} ({filteredData.length > 0 ? ((pieData[2].value / filteredData.length) * 100).toFixed(1) : '0'}%)
                      </span>
                    </div>
                    <div className="summary-stats">
                      {/* <div><b>Matched (In Range):</b> {stats.inRangeCount}</div>
                    <div><b>Outside Range:</b> {stats.outOfRangeCount}</div>
                    <div><b>Missing:</b> {pieData[2].value}</div> */}
                      {/* Remove Mean, keep only Avg */}
                      <div><b>Avg:</b> {stats.avg}</div>
                      <div><b>Min:</b> {stats.min}</div>
                      <div><b>Max:</b> {stats.max}</div>
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

            {/* Show time range above the grid, always visible for export */}
            {minTime && maxTime && (
              <div style={{
                textAlign: 'center',
                fontSize: 16,
                color: '#4f3ca7',
                fontWeight: 600,
                margin: '12px 0 8px 0',
                letterSpacing: 0.2,

              }}>
                Data Time Range: <span style={{ color: '#222', fontWeight: 700, }}>{new Date(minTime).toLocaleString()} — {new Date(maxTime).toLocaleString()}</span>
              </div>
            )}
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
      {/* Show total number of data points used for pie charts */}
      <div style={{
        marginTop: 32,
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
        Total data points: <span style={{ color: '#222', fontWeight: 700 }}>{filteredData.length}</span>
      </div>
    </div>
  );
}

export const getServerSideProps = async ({ req }) => {
  const cookies = cookie.parse(req.headers.cookie || "");
  const accessToken = cookies.accessToken || null;
  if (!accessToken) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  return { props: {} };
};