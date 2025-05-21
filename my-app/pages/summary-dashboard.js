import PageHeader from '../components/PageHeader';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import tableData from '../data/tableData';

const COLORS = ['#345995', '#6DECB9', '#F7B801', '#F18701', '#e75480', '#8884d8', '#82ca9d', '#ffc658'];

function getColumnStats(data, key) {
  const values = data.map(row => row[key]).filter(v => v !== null && v !== undefined && v !== '');
  if (values.length === 0) return { mean: '-', min: '-', max: '-', outsideSpec: '-', missing: '100%' };

  const mean = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
  const min = Math.min(...values).toFixed(2);
  const max = Math.max(...values).toFixed(2);

  const lower = Math.min(...values) + (Math.max(...values) - Math.min(...values)) * 0.1;
  const upper = Math.max(...values) - (Math.max(...values) - Math.min(...values)) * 0.1;
  const outsideSpecCount = values.filter(v => v < lower || v > upper).length;
  const outsideSpec = ((outsideSpecCount / values.length) * 100).toFixed(0) + ' %';

  const missing = (((data.length - values.length) / data.length) * 100).toFixed(0) + ' %';

  return { mean, min, max, outsideSpec, missing };
}

// Helper to get quantile value
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

// Use quantiles for bins so each bin has similar count
function getPieData(data, key) {
  const values = data.map(row => row[key]).filter(v => v !== null && v !== undefined && v !== '').sort((a, b) => a - b);
  if (values.length === 0) return [{ name: 'No Data', value: 1 }];
  if (values.length < 4) {
    // Not enough data for quartiles, just show each value as a slice
    return values.map((v, i) => ({ name: `Value ${i + 1}: ${v}`, value: 1 }));
  }
  const q1 = quantile(values, 0.25);
  const q2 = quantile(values, 0.5);
  const q3 = quantile(values, 0.75);
  const bins = [0, 0, 0, 0];
  values.forEach(v => {
    if (v <= q1) bins[0]++;
    else if (v <= q2) bins[1]++;
    else if (v <= q3) bins[2]++;
    else bins[3]++;
  });
  return [
    { name: `≤ Q1 (${q1.toFixed(2)})`, value: bins[0] },
    { name: `Q1-Q2 (${q1.toFixed(2)}-${q2.toFixed(2)})`, value: bins[1] },
    { name: `Q2-Q3 (${q2.toFixed(2)}-${q3.toFixed(2)})`, value: bins[2] },
    { name: `> Q3 (${q3.toFixed(2)})`, value: bins[3] }
  ];
}

function CustomTooltip({ active, payload, stats, col }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.98)',
        border: '1px solid #ececff',
        borderRadius: 16,
        boxShadow: '0 8px 32px #6c63ff22',
        padding: 18,
        minWidth: 200,
        fontSize: 15,
        color: '#222',
        pointerEvents: 'auto'
      }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: '#6c63ff', letterSpacing: 1 }}>{col.toUpperCase()}</div>
        <div style={{ marginBottom: 6 }}><b>{payload[0].name}</b>: {payload[0].value}</div>
        <div>Mean: <b>{stats.mean}</b></div>
        <div>Min: <b>{stats.min}</b></div>
        <div>Max: <b>{stats.max}</b></div>
        <div>Outside Spec: <b>{stats.outsideSpec}</b></div>
        <div>Missing Data: <b>{stats.missing}</b></div>
      </div>
    );
  }
  return null;
}

export default function SummaryDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleRefresh() {
    window.location.reload();
  }
  function handleDateRange() {
    alert('Date range picker would open here.');
  }

  const columns = Object.keys(tableData[0] || {}).filter(key => key !== 'time');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f7f8fa 0%, #e3e6f3 100%)',
      padding: 0,
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    }}>
      <PageHeader title="Summary Dashboard" />
      <div style={{
        position: 'absolute',
        right: 80,
        top: 40,
        display: 'flex',
        gap: 16
      }}>
        <button style={headerBtnStyle} onClick={handleRefresh}>Refresh <span style={{ fontSize: 22 }}>▼</span></button>
        <button style={headerBtnStyle} onClick={handleDateRange}>Date Range <span style={{ fontSize: 22 }}>▼</span></button>
      </div>
      {mounted && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(370px, 1fr))',
          gap: 48,
          marginTop: 80,
          marginLeft: 40,
          marginRight: 40,
          marginBottom: 40
        }}>
          {columns.map((col, idx) => {
            const stats = getColumnStats(tableData, col);
            const pieData = getPieData(tableData, col);
            return (
              <div
                key={col}
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  boxShadow: '0 8px 32px #6c63ff22',
                  padding: 32,
                  marginBottom: 0,
                  width: '100%',
                  maxWidth: 420,
                  transition: 'box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{
                  fontWeight: 800,
                  fontSize: 22,
                  marginBottom: 18,
                  letterSpacing: 1,
                  color: '#6c63ff'
                }}>
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
                            cursor: 'pointer',
                            transition: 'filter 0.2s'
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={props => (
                        <CustomTooltip {...props} stats={stats} col={col} />
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  marginTop: 18,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  fontSize: 15,
                  color: '#444'
                }}>
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