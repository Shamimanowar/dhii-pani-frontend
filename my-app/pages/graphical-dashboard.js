import PageHeader from '../components/PageHeader';
import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, AreaChart, Area, Brush, Legend, BarChart, Bar, ResponsiveContainer
} from 'recharts';

const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTpUL4EZZPzXJDgjqKncdHpPk9G0-fwGZYepx5cJvW5OAgeGUbVkmQ-kBTYCvqlNz6Za8RYMFxD5B2T/pub?gid=1991120722&single=true&output=csv";

const COLORS = [
  "#e75480", "#764ba2", "#667eea", "#4f3ca7", "#00b894", "#fdcb6e", "#0984e3", "#d63031", "#636e72"
];

const COLUMN_LABELS = {
  temp: "Temperature (°C)",
  bod: "BOD",
  cod: "COD",
  ph: "pH",
  tds: "TDS",
  do: "DO",
  chroma: "Chroma",
  tss: "TSS"
};

const LIMITS = {
  temp: { upper: 32.04, lower: 31.93 },
  tds: { upper: 2500, lower: 0 },
  bod: { upper: 10, lower: 0 },
  cod: { upper: 50, lower: 0 },
  ph: { upper: 8, lower: 6 },
  do: { upper: 10, lower: 4 },
  chroma: { upper: 20, lower: 0 },
  tss: { upper: 50, lower: 0 }
};

// Helper for formatting time for Brush
function brushTickFormatter(str) {
  if (!str) return '';
  const parts = str.split(' ');
  if (parts.length === 2) {
    const [date, time] = parts;
    // Show date and time in short form
    return `${date.slice(5)} ${time.slice(0, 5)}`; // MM-DD HH:mm
  }
  return str;
}

export default function GraphicalDashboard() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetch(GOOGLE_SHEET_CSV_URL)
      .then(res => res.ok ? res.text() : Promise.reject())
      .then(csv => {
        const [header, ...rows] = csv.trim().split('\n');
        const keys = header.split(',').map(k => k.trim().toLowerCase());
        const parsed = rows
          .map(row => {
            const vals = row.split(',');
            return Object.fromEntries(
              vals.map((v, i) => [
                keys[i],
                isNaN(Number(v)) || v.trim() === '' ? v : Number(v)
              ])
            );
          })
          .filter(row => row.time);
        setData(parsed);
        setLoading(false);
      })
      .catch(() => setData([]));
  }, []);

  function handleRefresh() {
    setLoading(true);
    fetch(GOOGLE_SHEET_CSV_URL)
      .then(res => res.ok ? res.text() : Promise.reject())
      .then(csv => {
        const [header, ...rows] = csv.trim().split('\n');
        const keys = header.split(',').map(k => k.trim().toLowerCase());
        const parsed = rows
          .map(row => {
            const vals = row.split(',');
            return Object.fromEntries(
              vals.map((v, i) => [
                keys[i],
                isNaN(Number(v)) || v.trim() === '' ? v : Number(v)
              ])
            );
          })
          .filter(row => row.time);
        setData(parsed);
        setLoading(false);
      })
      .catch(() => setData([]));
  }

  function handleDateRange() {
    alert('Date range picker would open here.');
  }

  // Helper to render a modern card for each metric
  function renderChart(metric, idx) {
    if (!data.length) return null;
    const color = COLORS[idx % COLORS.length];
    const label = COLUMN_LABELS[metric] || metric.toUpperCase();
    const limits = LIMITS[metric];

    // Use LineChart for most, AreaChart for TDS, BarChart for TSS
    if (metric === "tds") {
      return (
        <div key={metric} style={cardStyle}>
          <div style={cardTitleStyle}>{label}</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`color${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} minTickGap={24} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              {limits && <ReferenceLine y={limits.upper} label="Upper" stroke="#222" strokeDasharray="3 3" />}
              {limits && <ReferenceLine y={limits.lower} label="Lower" stroke="#222" strokeDasharray="3 3" />}
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
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} minTickGap={24} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              {limits && <ReferenceLine y={limits.upper} label="Upper" stroke="#222" strokeDasharray="3 3" />}
              {limits && <ReferenceLine y={limits.lower} label="Lower" stroke="#222" strokeDasharray="3 3" />}
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
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            {limits && <ReferenceLine y={limits.upper} label="Upper" stroke="#222" strokeDasharray="3 3" />}
            {limits && <ReferenceLine y={limits.lower} label="Lower" stroke="#222" strokeDasharray="3 3" />}
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

  // All metrics except "time"
  const metrics = Object.keys(COLUMN_LABELS);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f7f8fa 0%, #e3e6f3 100%)',
      padding: 0,
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    }}>
      <PageHeader title="Graphical Dashboard" />
      <div style={{
        position: 'absolute',
        right: 80,
        top: 40,
        display: 'flex',
        gap: 16
      }}>
        <button style={headerBtnStyle} onClick={handleRefresh}>
          {loading ? <span className="dt-refresh-anim" style={{ display: 'inline-block' }}>⟳</span> : <>Refresh <span style={{ fontSize: 22 }}>▼</span></>}
        </button>
        <button style={headerBtnStyle} onClick={handleDateRange}>Date Range <span style={{ fontSize: 22 }}>▼</span></button>
      </div>
      <style>{`
        .dt-refresh-anim {
          animation: dtSpin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes dtSpin {
          100% { transform: rotate(360deg);}
        }
      `}</style>
      {mounted && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 36,
          marginTop: 80,
          marginLeft: 40,
          marginRight: 40,
          marginBottom: 40
        }}>
          {metrics.map((metric, idx) => renderChart(metric, idx))}
        </div>
      )}
    </div>
  );
}

const headerBtnStyle = {
  fontWeight: 700,
  fontSize: 18,
  border: '2px solid #6c63ff',
  background: '#fff',
  color: '#6c63ff',
  padding: '8px 22px',
  borderRadius: 8,
  cursor: 'pointer',
  boxShadow: '0 2px 8px #6c63ff10',
  transition: 'background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s'
};

const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 4px 24px #6c63ff10',
  padding: '24px 18px 12px 18px',
  minWidth: 0,
  minHeight: 340,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch'
};

const cardTitleStyle = {
  fontWeight: 700,
  fontSize: 20,
  marginBottom: 12,
  color: '#6c63ff',
  letterSpacing: 1
};