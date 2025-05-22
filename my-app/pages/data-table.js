import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../components/PageHeader';
import { isOutOfRange } from '../utils/columnLimits';
import { exportCSV, exportExcel } from '../utils/exportUtils';
import useGoogleSheetData from '../hooks/useGoogleSheetData';
import DataTableBody from '../components/DataTableBody';
import cookie from 'cookie';
import { GetServerSideProps } from 'next';
import ControlBar from '../components/ControlBar';

const PAGE_SIZE = 20;
const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTpUL4EZZPzXJDgjqKncdHpPk9G0-fwGZYepx5cJvW5OAgeGUbVkmQ-kBTYCvqlNz6Za8RYMFxD5B2T/pub?gid=1991120722&single=true&output=csv";

export default function DataTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [fullRange, setFullRange] = useState([0, 0]);
  const { data, setData, refreshing, handleRefresh } = useGoogleSheetData(GOOGLE_SHEET_CSV_URL);

  // useEffect(() => {
  //   if (typeof window !== 'undefined' && localStorage.getItem('loggedIn') !== 'true') {
  //     router.replace('/login');
  //   }
  // }, [router]);

  // Compute fullRange from data
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const timestamps = data
        .map(row => new Date(row.time).getTime())
        .filter(Boolean)
        .sort((a, b) => a - b);
      if (timestamps.length) {
        setFullRange([timestamps[0], timestamps[timestamps.length - 1]]);
      }
    }
  }, [data]);

  const TOTAL_ENTRIES = data.length;
  const TOTAL_PAGES = Math.max(1, Math.ceil(TOTAL_ENTRIES / PAGE_SIZE));

  useEffect(() => {
    if (page > TOTAL_PAGES) setPage(TOTAL_PAGES || 1);
  }, [data, TOTAL_PAGES, page]);

  // Date picker handler
  function handleDateChange(e) {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page on filter
  }

  // Filter data by date range
  const filteredData = Array.isArray(data)
    ? data.filter(row => {
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
        return inDateRange;
      })
    : [];

  const TOTAL_FILTERED = filteredData.length;
  const TOTAL_FILTERED_PAGES = Math.max(1, Math.ceil(TOTAL_FILTERED / PAGE_SIZE));

  // Clamp page if needed after filtering
  useEffect(() => {
    if (page > TOTAL_FILTERED_PAGES) setPage(TOTAL_FILTERED_PAGES || 1);
  }, [TOTAL_FILTERED_PAGES, page]);

  const pagedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ControlBar props (date picker enabled)
  const controlBarProps = {
    exportOpen,
    setExportOpen,
    exportCSV: () => exportCSV(filteredData),
    exportJSON: undefined, // Not used here
    dateRange,
    fullRange,
    handleDateChange,
    filterMetric: '',
    setFilterMetric: () => {},
    COLUMN_LABELS: {},
    handleRefresh,
    loading: refreshing
  };

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= TOTAL_FILTERED_PAGES) setPage(newPage);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f7f8fa 0%, #e3e6f3 100%)',
      padding: 0,
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    }}>
      <style>{`
        .dt-table-container {
          width: 1200px;
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
      `}</style>
      <PageHeader title="Data Table" />
      <ControlBar {...controlBarProps} />
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
            fontSize: 16,

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
                <th style={thStyle}>COLOR</th>
                <th style={thStyle}>TSS</th>
              </tr>
            </thead>
            <DataTableBody data={pagedData} refreshing={refreshing} tdStyle={tdStyle} />
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
        Showing {pagedData.length > 0 ? (PAGE_SIZE * (page - 1) + 1) : 0} to {PAGE_SIZE * (page - 1) + pagedData.length} of {TOTAL_FILTERED} entries
      </div>
      {/* Pagination */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 18,
        gap: 8
      }}>
        <button disabled={page === 1} style={page === 1 ? paginationBtnDisabled : paginationBtn} onClick={() => handlePageChange(page - 1)}>Previous</button>
        {[...Array(Math.min(5, TOTAL_FILTERED_PAGES)).keys()].map(i => {
          const p = i + 1;
          return (
            <button
              key={p}
              style={page === p ? paginationBtnActive : paginationBtn}
              onClick={() => handlePageChange(p)}
            >{p}</button>
          );
        })}
        {TOTAL_FILTERED_PAGES > 5 && <span style={{ alignSelf: 'center', fontSize: 18 }}>...</span>}
        {TOTAL_FILTERED_PAGES > 5 && (
          <button style={paginationBtn} onClick={() => handlePageChange(TOTAL_FILTERED_PAGES)}>{TOTAL_FILTERED_PAGES}</button>
        )}
        <button disabled={page === TOTAL_FILTERED_PAGES} style={page === TOTAL_FILTERED_PAGES ? paginationBtnDisabled : paginationBtn} onClick={() => handlePageChange(page + 1)}>Next</button>
      </div>
      {/* Note */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 24,
        color: '#888',
        fontSize: 14
      }}>
        {/* <span>This table uses live data from Google Sheets. To update, edit the sheet.</span> */}
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