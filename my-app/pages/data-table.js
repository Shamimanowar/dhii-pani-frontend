import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../components/PageHeader';
import { exportCSV, exportExcel } from '../utils/exportUtils';
import DataTableBody from '../components/DataTableBody';
import cookie from 'cookie';
import { GetServerSideProps } from 'next';
import ControlBar from '../components/ControlBar';
import '../css/data-table.css';

const PAGE_SIZE = 20;

// Helper to get the API endpoint from environment variable (for client-side fetches to Next.js API routes)
const API_DATA_ROUTE = "/api/data";
const API_LIMITS_ROUTE = "/api/sensor-data-range";

// Main DataTable page for displaying tabular sensor data from the backend API only.
// All data fetching, filtering, and export logic is handled here.
// No Google Sheets or mock data is used—API is the single source of truth.

export default function DataTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [fullRange, setFullRange] = useState([0, 0]);
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(0); // seconds
  const [filterApplied, setFilterApplied] = useState(false);
  const [limits, setLimits] = useState({});
  const autoRefreshTimer = useRef(null);

  // Fetches paginated data from the backend API, applying date filters if provided.
  // Stores results in state and sessionStorage for reuse by other dashboards.
  async function fetchData(customRange) {
    setLoading(true);
    let url = `${API_DATA_ROUTE}?limit=${PAGE_SIZE}&offset=${(page - 1) * PAGE_SIZE}`;
    // If a date range is provided, add it to the API query params.
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
      setCount(json.count || 0);
      setNextUrl(json.next);
      setPrevUrl(json.previous);
      setData(Array.isArray(json.results) ? json.results : []);
      // Store in sessionStorage for dashboard reuse (e.g., summary/graphical dashboards)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sensorDataCache', JSON.stringify(Array.isArray(json.results) ? json.results : []));
      }
    } catch (err) {
      // On error, clear data and show empty state
      setData([]);
      setCount(0);
      setNextUrl(null);
      setPrevUrl(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!filterApplied) fetchData();
  }, [page]);

  // Calculate the full date range available in the current data set
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const timestamps = data
        .map(row => new Date(row.timestamp).getTime())
        .filter(Boolean)
        .sort((a, b) => a - b);
      if (timestamps.length) {
        setFullRange([timestamps[0], timestamps[timestamps.length - 1]]);
      }
    }
  }, [data]);

  // Applies the selected date filter and fetches filtered data
  function handleDateFilterApply() {
    setFilterApplied(true);
    setPage(1);
    fetchData(dateRange);
  }

  // ControlBar props (date picker enabled)
  const controlBarProps = {
    exportOpen,
    setExportOpen,
    // Exports current data as CSV using utility
    exportCSV: () => exportCSV(data),
    // Exports current data as JSON
    exportJSON: () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "data-table.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },
    dateRange,
    // Handles changes to the date filter inputs
    handleDateChange: (e) => {
      const { name, value } = e.target;
      setDateRange(prev => ({ ...prev, [name]: value }));
    },
    onDateFilterApply: handleDateFilterApply,
    filterMetric: '',
    setFilterMetric: () => {},
    COLUMN_LABELS: {},
    handleRefresh: () => {
      setFilterApplied(false); // Reset filter so fetchData will run
      setPage(1); // Optionally reset to first page
      fetchData(); // Explicitly fetch data
    },
    loading,
    autoRefreshInterval,
    onAutoRefreshChange: setAutoRefreshInterval,
  };

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= Math.ceil(count / PAGE_SIZE)) setPage(newPage);
  }

  // Pagination button handlers for API-based pagination
  function handleNext() {
    if (nextUrl) setPage(page + 1);
  }
  function handlePrev() {
    if (prevUrl) setPage(page - 1);
  }

  useEffect(() => {
    if (autoRefreshTimer.current) clearInterval(autoRefreshTimer.current);
    if (autoRefreshInterval > 0) {
      autoRefreshTimer.current = setInterval(() => {
        setPage(1);
      }, autoRefreshInterval * 1000);
    }
    return () => {
      if (autoRefreshTimer.current) clearInterval(autoRefreshTimer.current);
    };
  }, [autoRefreshInterval]);

  // Fetch limits from backend
  useEffect(() => {
    fetch(API_LIMITS_ROUTE, { credentials: 'include' })
      .then(res => res.json())
      .then(setLimits)
      .catch(() => setLimits({}));
  }, []);

  const pagedData = data;

  return (
    <div className="data-table-bg">
      <PageHeader title="Data Table" />
      <ControlBar
        {...controlBarProps}
        exportLabelCSV="Export as CSV"
        exportLabelJSON="Export as JSON"
      />
      {/* Table */}
      <div className="data-table-header">
        <div className="dt-table-container">
          <table className="data-table-table">
            <thead className="data-table-thead">
              <tr>
                <th className="data-table-th">TIME</th>
                <th className="data-table-th">TEMP</th>
                <th className="data-table-th">BOD</th>
                <th className="data-table-th">COD</th>
                <th className="data-table-th">PH</th>
                <th className="data-table-th">TDS</th>
                <th className="data-table-th">DO</th>
                <th className="data-table-th">COLOR</th>
                <th className="data-table-th">TSS</th>
              </tr>
            </thead>
            <DataTableBody data={pagedData} refreshing={loading} limits={limits} />
          </table>
        </div>
      </div>
      {/* Table Footer */}
      <div className="data-table-entries">
        Showing {pagedData.length > 0 ? (PAGE_SIZE * (page - 1) + 1) : 0} to {PAGE_SIZE * (page - 1) + pagedData.length} of {count} entries
      </div>
      {/* Pagination */}
      <div className="data-table-pagination">
        <button disabled={!prevUrl || page === 1} className={`data-table-pagination-btn${!prevUrl || page === 1 ? ' disabled' : ''}`} onClick={handlePrev}>Previous</button>
        {/* Sliding window pagination logic */}
        {(() => {
          const totalPages = Math.ceil(count / PAGE_SIZE);
          let start = Math.max(1, page - 2);
          let end = Math.min(totalPages, start + 4);
          if (end - start < 4) start = Math.max(1, end - 4);
          const pageButtons = [];
          if (start > 1) {
            pageButtons.push(
              <button key={1} className={`data-table-pagination-btn${page === 1 ? ' active' : ''}`} onClick={() => handlePageChange(1)}>1</button>
            );
            if (start > 2) pageButtons.push(<span key="start-ellipsis" style={{ alignSelf: 'center', fontSize: 18 }}>...</span>);
          }
          for (let p = start; p <= end; ++p) {
            pageButtons.push(
              <button
                key={p}
                className={`data-table-pagination-btn${page === p ? ' active' : ''}`}
                onClick={() => handlePageChange(p)}
              >{p}</button>
            );
          }
          if (end < totalPages) {
            if (end < totalPages - 1) pageButtons.push(<span key="end-ellipsis" style={{ alignSelf: 'center', fontSize: 18 }}>...</span>);
            pageButtons.push(
              <button key={totalPages} className={`data-table-pagination-btn${page === totalPages ? ' active' : ''}`} onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
            );
          }
          return pageButtons;
        })()}
        <button disabled={!nextUrl || page === Math.ceil(count / PAGE_SIZE)} className={`data-table-pagination-btn${!nextUrl || page === Math.ceil(count / PAGE_SIZE) ? ' disabled' : ''}`} onClick={handleNext}>Next</button>
      </div>
      {/* Note */}
      <div className="data-table-note">
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
