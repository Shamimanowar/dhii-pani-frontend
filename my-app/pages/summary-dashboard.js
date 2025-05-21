import PageHeader from "../components/PageHeader";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import tableData from "../data/tableData";
import ControlBar from "../components/ControlBar";

// Modern color palette
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

// Stats helper
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

// Quantile helper
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

// Pie data helper
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

// Tooltip
function CustomTooltip({ active, payload, stats, col }) {
  // Fix: Only render if active AND payload[0] exists AND payload[0].payload exists
  if (active && payload && payload.length && payload[0] && payload[0].payload) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.98)",
          border: "1px solid #ececff",
          borderRadius: 16,
          boxShadow: "0 8px 32px #6c63ff22",
          padding: 18,
          minWidth: 200,
          fontSize: 15,
          color: "#222",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 18,
            marginBottom: 8,
            color: "#6c63ff",
            letterSpacing: 1,
          }}
        >
          {col.toUpperCase()}
        </div>
        <div style={{ marginBottom: 6 }}>
          <b>{payload[0].name}</b>: {payload[0].value}
        </div>
        <div>
          Mean: <b>{stats.mean}</b>
        </div>
        <div>
          Min: <b>{stats.min}</b>
        </div>
        <div>
          Max: <b>{stats.max}</b>
        </div>
        <div>
          Outside Spec: <b>{stats.outsideSpec}</b>
        </div>
        <div>
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
  const [dateRange, setDateRange] = useState({ from: "", to: "" }); // Start blank
  const [fullRange, setFullRange] = useState([0, 0]);
  const [exportOpen, setExportOpen] = useState(false);
  const [filterColumn, setFilterColumn] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // On mount, set up data and date range
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
    setDateRange({ from: "", to: "" }); // Clear date fields on refresh
  }

  function handleDateChange(e) {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  }

  // Export helpers
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
    const columnOk = filterColumn
      ? row[filterColumn] !== undefined &&
        row[filterColumn] !== null &&
        row[filterColumn] !== ""
      : true;
    return inDateRange && columnOk;
  });

  // Only show the selected column, or all if none selected
  const columns = Object.keys(tableData[0] || {}).filter(
    (key) => key !== "time" && (!filterColumn || key === filterColumn)
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f7f8fa 0%, #e3e6f3 100%)",
        padding: 0,
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
        position: "relative",
      }}
    >
      {/* Header with controls below */}
      <div
        style={{
          background: "linear-gradient(120deg, rgb(247, 248, 250) 0%, rgb(227, 230, 243) 100%)",
          borderBottom: "1.5px solid #ececff",
          boxShadow: "0 4px 24px #6c63ff10",
          padding: 0,
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            // maxWidth: 1200,
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
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
          <div
            className="responsive-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: 36,
              marginTop: 40,
              marginLeft: 0, // removed left margin
              marginRight: 0, // removed right margin
              marginBottom: 40,
            }}
          >
            {columns.map((col, idx) => {
              const stats = getColumnStats(filteredData, col);
              const pieData = getPieData(filteredData, col);
              return (
                <div
                  key={col}
                  className="responsive-card"
                  style={{
                    background:
                      "linear-gradient(120deg, #fff 60%, #f7f8fa 100%)",
                    borderRadius: 18,
                    boxShadow: "0 8px 32px #6c63ff18",
                    padding: 24,
                    marginBottom: 0,
                    width: "100%",
                    maxWidth: 420,
                    minWidth: 0,
                    transition: "box-shadow 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    border: "1.5px solid #ececff",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 22,
                      marginBottom: 18,
                      letterSpacing: 1,
                      color: "#6c63ff",
                      textAlign: "center",
                    }}
                  >
                    {col.toUpperCase()}
                  </div>
                  <ResponsiveContainer width={260} height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
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
                            style={{
                              cursor: "pointer",
                              transition: "filter 0.2s",
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={(props) => (
                          <CustomTooltip {...props} stats={stats} col={col} />
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      marginTop: 18,
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      fontSize: 15,
                      color: "#444",
                    }}
                  >
                    <div>
                      <b>Mean:</b> {stats.mean}
                    </div>
                    <div>
                      <b>Min:</b> {stats.min}
                    </div>
                    <div>
                      <b>Max:</b> {stats.max}
                    </div>
                    <div>
                      <b>Outside Spec:</b> {stats.outsideSpec}
                    </div>
                    <div>
                      <b>Missing Data:</b> {stats.missing}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
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
            : "No data to display. Please select a date range or adjust filters."}
        </div>
      )}
      {/* Responsive styles */}
      <style>{`
        .dt-refresh-anim {
          animation: dtSpin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes dtSpin {
          100% { transform: rotate(360deg);}
        }
        @media (max-width: 900px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
            gap: 18px !important;
            margin-left: 4px !important;
            margin-right: 4px !important;
          }
          .responsive-card {
            max-width: 100vw !important;
            min-width: 0 !important;
            padding: 12px !important;
          }
        }
        @media (max-width: 600px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            margin-left: 1px !important;
            margin-right: 1px !important;
          }
          .responsive-card {
            padding: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
