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
  filterMetric,
  setFilterMetric,
  COLUMN_LABELS,
  handleRefresh,
  loading,
  autoRefreshInterval = 0,
  onAutoRefreshChange = () => {},
}) => {
  // Detect if exportCSV or exportJSON are undefined (for dashboards)
  const isImageExport = !exportJSON;
  return (
    <div className="control-bar-sticky">
      <div className="control-bar-main">
        {/* Export Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            className="control-bar-header-btn"
            onClick={() => setExportOpen((v) => !v)}
          >
            Export ▼
          </button>
          {exportOpen && (
            <div className="control-bar-export-dropdown">
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
        <label style={{ fontWeight: 600, color: "#6c63ff", fontSize: 15 }}>
          Date:
        </label>
        <input
          type="datetime-local"
          name="from"
          value={dateRange.from ? dateRange.from : ''}
          min={
            fullRange[0]
              ? new Date(fullRange[0]).toISOString().slice(0, 16)
              : ""
          }
          max={dateRange.to ? dateRange.to : ''}
          onChange={handleDateChange}
          className="control-bar-date-input"
        />
        <span style={{ color: "#6c63ff", fontWeight: 600 }}>to</span>
        <input
          type="datetime-local"
          name="to"
          value={dateRange.to ? dateRange.to : ''}
          min={dateRange.from ? dateRange.from : ''}
          max={
            fullRange[1]
              ? new Date(fullRange[1]).toISOString().slice(0, 16)
              : ""
          }
          onChange={handleDateChange}
          className="control-bar-date-input"
        />
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
          className="control-bar-select"
          style={{ marginLeft: 12, minWidth: 120 }}
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
          className="control-bar-header-btn"
          style={{ width: 130, height: 36 }}
          onClick={handleRefresh}
        >
          {loading ? (
            <span className="dt-refresh-anim">⟳</span>
          ) : (
            <>
              Refresh <span style={{ fontSize: 22 }}>▼</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ControlBar;