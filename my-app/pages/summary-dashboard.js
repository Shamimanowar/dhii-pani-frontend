import PageHeader from "../components/PageHeader";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import tableData from "../data/tableData";
import ControlBar from "../components/ControlBar";
import cookie from "cookie";
import '../css/summary-dashboard.css';

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
  return [
    { name: `≤ Q1 (${q1.toFixed(2)})`, value: bins[0] },
    { name: `Q1-Q2 (${q1.toFixed(2)}-${q2.toFixed(2)})`, value: bins[1] },
    { name: `Q2-Q3 (${q2.toFixed(2)}-${q3.toFixed(2)})`, value: bins[2] },
    { name: `> Q3 (${q3.toFixed(2)})`, value: bins[3] },
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

const COLUMN_LABELS = Object.keys(tableData[0] || {}).filter(k => k !== "time").reduce((acc, k) => {
  acc[k] = k.toUpperCase();
  return acc;
}, {});

export default function SummaryDashboard() {
  const [mounted, setMounted] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [fullRange, setFullRange] = useState([0, 0]);
  const [exportOpen, setExportOpen] = useState(false);
  const [filterColumn, setFilterColumn] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchData();
    // eslint-disable-next-line
  }, []);

  function fetchData() {
    setLoading(true);
    setTimeout(() => {
      setData(tableData);
      if (tableData && tableData.length) {
        const timestamps = tableData
          .map((row) => new Date(row.time).getTime())
          .filter(Boolean)
          .sort((a, b) => a - b);
        if (timestamps.length) {
          setFullRange([timestamps[0], timestamps[timestamps.length - 1]]);
        }
      }
      setLoading(false);
    }, 300);
  }

  function handleRefresh() {
    fetchData();
    setDateRange({ from: "", to: "" });
  }

  function handleDateChange(e) {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  }

  function exportCSV() {
    const filtered = filteredData;
    if (!filtered.length) return;
    const keys = Object.keys(filtered[0]);
    const csvRows = [
      keys.join(","),
      ...filtered.map((row) => keys.map((k) => `"${row[k] ?? ""}"`).join(",")),
    ];
    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary-dashboard.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function exportJSON() {
    const filtered = filteredData;
    if (!filtered.length) return;
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary-dashboard.json";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Filter data by date range and selected column (metric)
  const filteredData = data.filter((row) => {
    if (!row.time) return false;
    const t = new Date(row.time).getTime();
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

  const columns = Object.keys(tableData[0] || {}).filter(
    (key) => key !== "time" && (!filterColumn || key === filterColumn)
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
            exportCSV={exportCSV}
            exportJSON={exportJSON}
            dateRange={dateRange}
            fullRange={fullRange}
            handleDateChange={handleDateChange}
            filterMetric={filterColumn}
            setFilterMetric={setFilterColumn}
            COLUMN_LABELS={COLUMN_LABELS}
            handleRefresh={handleRefresh}
            loading={loading}
          />
          <div className="summary-grid">
            {columns.map((col, idx) => {
              const stats = getColumnStats(filteredData, col);
              const pieData = getPieData(filteredData, col);
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