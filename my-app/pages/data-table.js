import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../components/PageHeader';

const PAGE_SIZE = 10;
const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTpUL4EZZPzXJDgjqKncdHpPk9G0-fwGZYepx5cJvW5OAgeGUbVkmQ-kBTYCvqlNz6Za8RYMFxD5B2T/pub?gid=1991120722&single=true&output=csv";

export default function DataTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Fetch Google Sheets CSV and parse it
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  function fetchData() {
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
      })
      .catch(() => setData([]));
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('loggedIn') !== 'true') {
      router.replace('/login');
    }
  }, [router]);

  const TOTAL_ENTRIES = data.length;
  const TOTAL_PAGES = Math.max(1, Math.ceil(TOTAL_ENTRIES / PAGE_SIZE));

  useEffect(() => {
    if (page > TOTAL_PAGES) setPage(TOTAL_PAGES || 1);
  }, [data, TOTAL_PAGES, page]);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      fetchData();
      setRefreshing(false);
    }, 600);
  }

  function handleDateRange() {
    alert('Date range picker would open here.');
  }

  function handleExportCSV() {
    if (!data.length) return;
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = header + '\n' + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-table.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function handleExportExcel() {
    if (!data.length) return;
    let table = '<table><tr>';
    Object.keys(data[0]).forEach(key => { table += `<th>${key}</th>`; });
    table += '</tr>';
    data.forEach(row => {
      table += '<tr>';
      Object.values(row).forEach(val => { table += `<td>${val}</td>`; });
      table += '</tr>';
    });
    table += '</table>';
    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-table.xls';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function handleExportOption(type) {
    setExportOpen(false);
    if (type === 'csv') handleExportCSV();
    if (type === 'excel') handleExportExcel();
  }

  function handlePageChange(newPage) {
    setPage(newPage);
  }

  const pagedData = Array.isArray(data) ? data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : [];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f7f8fa 0%, #e3e6f3 100%)',
      padding: 0,
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    }}>
      <style>{`
        .dt-table-container {
          width: 1150px;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
          overflow: hidden;
          border: 1.5px solid #ececff;
          transition: box-shadow 0.3s;
          margin-bottom: 24px;
        }
        .dt-table-container:hover {
          box-shadow: 0 12px 40px 0 rgba(118, 75, 162, 0.13);
        }
        .dt-row-anim {
          animation: dtRowFadeIn 0.6s;
        }
        @keyframes dtRowFadeIn {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .dt-refresh-anim {
          animation: dtSpin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes dtSpin {
          100% { transform: rotate(360deg);}
        }
        .export-dropdown {
          position: relative;
          display: inline-block;
        }
        .export-dropdown-btn {
          ${Object.entries(headerBtnStyle).map(([k, v]) => `${k}:${typeof v === 'number' ? v + 'px' : v};`).join('')}
        }
        .export-dropdown-content {
          display: none;
          position: absolute;
          right: 0;
          background: #fff;
          min-width: 160px;
          box-shadow: 0 4px 16px #6c63ff22;
          border-radius: 8px;
          z-index: 100;
          margin-top: 8px;
        }
        .export-dropdown.open .export-dropdown-content {
          display: block;
        }
        .export-dropdown-item {
          color: #6c63ff;
          padding: 12px 18px;
          text-decoration: none;
          display: block;
          font-weight: 600;
          font-size: 16px;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .export-dropdown-item:hover {
          background: #f3f3ff;
        }
      `}</style>
      <PageHeader title="Data Table" />
      {/* Export Options Dropdown */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginRight: 80,
        marginTop: -60,
        marginBottom: 8,
        gap: 0
      }}>
        <div className={`export-dropdown${exportOpen ? ' open' : ''}`}>
          <button
            className="export-dropdown-btn"
            onClick={() => setExportOpen(v => !v)}
            style={{ ...headerBtnStyle, minWidth: 140 }}
          >
            Export ▼
          </button>
          <div className="export-dropdown-content">
            <button className="export-dropdown-item" onClick={() => handleExportOption('csv')}>Export as CSV</button>
            <button className="export-dropdown-item" onClick={() => handleExportOption('excel')}>Export as Excel</button>
          </div>
        </div>
      </div>
      {/* Header Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        gap: 16,
        marginRight: 80,
        marginTop: 0
      }}>
        <button style={headerBtnStyle} onClick={handleDateRange}>Date Range <span style={{ fontSize: 22 }}>▼</span></button>
        <button style={headerBtnStyle} onClick={handleRefresh}>
          {refreshing
            ? <span className="dt-refresh-anim" style={{ display: 'inline-block' }}>⟳</span>
            : <>Refresh <span style={{ fontSize: 22 }}>▼</span></>
          }
        </button>
      </div>
      {/* Table */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 32,
        width: '100%'
      }}>
        <div className="dt-table-container">
          <table style={{
            borderCollapse: 'collapse',
            width: '100%',
            background: '#fff',
            fontSize: 16
          }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                fontWeight: 700
              }}>
                <th style={thStyle}>TIME</th>
                <th style={thStyle}>TEMP</th>
                <th style={thStyle}>BOD</th>
                <th style={thStyle}>COD</th>
                <th style={thStyle}>PH</th>
                <th style={thStyle}>TDS</th>
                <th style={thStyle}>DO</th>
                <th style={thStyle}>CHROMA</th>
                <th style={thStyle}>TSS</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.map((row, i) => (
                <tr
                  key={i}
                  className={refreshing ? '' : 'dt-row-anim'}
                  style={{
                    background: i % 2 === 0 ? '#f8f9fc' : '#fff',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e6eaff'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#f8f9fc' : '#fff'}
                >
                  <td style={tdStyle}>{row.time}</td>
                  <td style={tdStyle}>{row.temp}</td>
                  <td style={tdStyle}>{row.bod}</td>
                  <td style={tdStyle}>{row.cod}</td>
                  <td style={tdStyle}>{row.ph}</td>
                  <td style={{ ...tdStyle, background: '#ffeaea', fontWeight: 600 }}>{row.tds}</td>
                  <td style={tdStyle}>{row.do}</td>
                  <td style={tdStyle}>{row.chroma}</td>
                  <td style={tdStyle}>{row.tss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Table Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 16,
        color: '#888',
        fontSize: 15
      }}>
        Showing {pagedData.length > 0 ? (PAGE_SIZE * (page - 1) + 1) : 0} to {PAGE_SIZE * (page - 1) + pagedData.length} of {TOTAL_ENTRIES} entries
      </div>
      {/* Pagination */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 18,
        gap: 8
      }}>
        <button disabled={page === 1} style={page === 1 ? paginationBtnDisabled : paginationBtn} onClick={() => handlePageChange(page - 1)}>Previous</button>
        {[1, 2, 3, 4, 5].map(p => (
          <button
            key={p}
            style={page === p ? paginationBtnActive : paginationBtn}
            onClick={() => handlePageChange(p)}
          >{p}</button>
        ))}
        <span style={{ alignSelf: 'center', fontSize: 18 }}>...</span>
        <button style={paginationBtn} onClick={() => handlePageChange(TOTAL_PAGES)}>{TOTAL_PAGES}</button>
        <button disabled={page === TOTAL_PAGES} style={page === TOTAL_PAGES ? paginationBtnDisabled : paginationBtn} onClick={() => handlePageChange(page + 1)}>Next</button>
      </div>
      {/* Note */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 24,
        color: '#888',
        fontSize: 14
      }}>
        <span>This table uses live data from Google Sheets. To update, edit the sheet.</span>
      </div>
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

const thStyle = {
  padding: '12px 18px',
  borderBottom: '2px solid #ececff',
  textAlign: 'left',
  fontSize: 15,
  letterSpacing: 1
};
const tdStyle = {
  padding: '11px 18px',
  borderBottom: '1px solid #f0f0f0',
  textAlign: 'left',
  fontSize: 15
};
const paginationBtn = {
  padding: '7px 16px',
  border: 'none',
  background: '#f3f3f3',
  borderRadius: 6,
  fontWeight: 500,
  fontSize: 16,
  color: '#6c63ff',
  cursor: 'pointer',
  transition: 'background 0.2s, color 0.2s, transform 0.2s'
};
const paginationBtnActive = {
  ...paginationBtn,
  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  color: '#fff',
  fontWeight: 700,
  transform: 'scale(1.08)'
};
const paginationBtnDisabled = {
  ...paginationBtn,
  background: '#eaeaea',
  color: '#aaa',
  cursor: 'not-allowed'
};