import React from "react";
import '../css/control-bar.css';

const ControlBar = ({
  exportOpen,
  setExportOpen,
  exportCSV,
  exportJSON,
  exportLabelCSV = "Export as CSV",
  exportLabelJSON = "Export as JSON",
  dateRange,
  fullRange,
  handleDateChange,
  onDateFilterApply = () => { },
  filterMetric,
  setFilterMetric,
  COLUMN_LABELS,
  handleRefresh,
  loading,
  autoRefreshInterval = 0,
  onAutoRefreshChange = () => { },
  exportCount, // NEW: controlled export count
  setExportCount, // NEW: controlled setter
  maxExportCount, // NEW: max export count
}) => {
  // Detect if exportCSV or exportJSON are undefined (for dashboards)
  const isImageExport = !exportJSON;

  // Get current time in ISO format for max attribute
  const nowISO = new Date().toISOString().slice(0, 16);

  return (
    <div className="control-bar-sticky">
      <div className="control-bar-main">
        {/* Export Dropdown */}
        <div className="control-bar-relative">
          <button
            className="control-bar-header-btn"
            onClick={() => setExportOpen((v) => !v)}
          >
            Export ▼
          </button>
          {exportOpen && (
            <div className="control-bar-export-dropdown">
              {/* Export count input for data-table only (show if exportCSV and exportJSON are present) */}
              {exportCSV && exportJSON && exportCount !== undefined && setExportCount && maxExportCount !== undefined && (
                <div style={{ padding: '10px 18px 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="export-count" style={{ fontWeight: 500, fontSize: 15 }}>Export Count:</label>
                  <input
                    id="export-count"
                    type="number"
                    min={1}
                    max={maxExportCount}
                    value={exportCount}
                    onChange={e => {
                      let val = parseInt(e.target.value, 10);
                      if (isNaN(val) || val < 1) val = 1;
                      if (val > maxExportCount) val = maxExportCount;
                      setExportCount(val);
                    }}
                    style={{ width: 90, padding: 4, fontSize: 15, borderRadius: 6, border: '1.5px solid #ececff' }}
                  />
                  <span style={{ color: '#888', fontSize: 13 }}>(max: {maxExportCount})</span>
                </div>
              )}
              {isImageExport ? (
                <button
                  className="control-bar-export-item"
                  onClick={() => {
                    exportCSV();
                    setExportOpen(false);
                  }}
                >
                  Export as Image
                </button>
              ) : (
                <>
                  <button
                    className="control-bar-export-item"
                    onClick={() => {
                      exportCSV();
                      setExportOpen(false);
                    }}
                  >
                    {exportLabelCSV}
                  </button>
                  <button
                    className="control-bar-export-item"
                    onClick={() => {
                      exportJSON();
                      setExportOpen(false);
                    }}
                  >
                    {exportLabelJSON}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {/* Date Range */}
        <label className="control-bar-label">
          Date:
        </label>
        <input
          type="datetime-local"
          name="from"
          value={dateRange.from}
          onChange={handleDateChange}
          max={dateRange.to || nowISO}
          className="control-bar-date-input"
        />
        <input
          type="datetime-local"
          name="to"
          value={dateRange.to}
          onChange={handleDateChange}
          max={nowISO}
          className="control-bar-date-input"
        />
        <button
          className="control-bar-header-btn control-bar-ml-8"
          onClick={onDateFilterApply}
        >Apply</button>
        {/* Filter Metric Dropdown */}
        <select
          value={filterMetric}
          onChange={(e) => setFilterMetric(e.target.value)}
          className="control-bar-select"
        >
          <option value="">Show All</option>
          {Object.entries(COLUMN_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        {/* Auto Refresh Dropdown */}
        <select
          className="control-bar-select control-bar-ml-12"
          value={autoRefreshInterval}
          onChange={e => onAutoRefreshChange(Number(e.target.value))}
        >
          <option value={0}>Auto Refresh: Off</option>
          <option value={180}>Every 3 min</option>
          <option value={600}>Every 10 min</option>
          <option value={1800}>Every 30 min</option>
          <option value={3600}>Every 1 hour</option>
        </select>
        {/* Refresh */}
        <button
          className="control-bar-header-btn control-bar-btn-130-36"
          onClick={handleRefresh}
        >
          {loading ? (
            <span className="dt-refresh-anim">⟳</span>
          ) : (
            <>
              Refresh <span className="control-bar-fs-18">▼</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ControlBar;