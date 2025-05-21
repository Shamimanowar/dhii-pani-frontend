import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../components/PageHeader';
import { isOutOfRange } from '../utils/columnLimits';
import { exportCSV, exportExcel } from '../utils/exportUtils';
import useGoogleSheetData from '../hooks/useGoogleSheetData';
import DataTableBody from '../components/DataTableBody';
import ControlBar from '../components/ControlBar';

const PAGE_SIZE = 20;
const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTpUL4EZZPzXJDgjqKncdHpPk9G0-fwGZYepx5cJvW5OAgeGUbVkmQ-kBTYCvqlNz6Za8RYMFxD5B2T/pub?gid=1991120722&single=true&output=csv";

export default function DataTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const { data, setData, refreshing, handleRefresh } = useGoogleSheetData(GOOGLE_SHEET_CSV_URL);

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

  // Dummy props for ControlBar (no filter/date for this table)
  const controlBarProps = {
    exportOpen,
    setExportOpen,
    exportCSV: () => exportCSV(data),
    exportJSON: undefined, // Not used here
    dateRange: { from: '', to: '' },
    fullRange: [0, 0],
    handleDateChange: () => {},
    filterMetric: '',
    setFilterMetric: () => {},
    COLUMN_LABELS: {},
    handleRefresh,
    loading: refreshing
  };

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