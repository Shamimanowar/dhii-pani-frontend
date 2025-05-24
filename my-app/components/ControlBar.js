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
  onDateFilterApply = () => {},
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

  // Get current time in ISO format for max attribute
  const nowISO = new Date().toISOString().slice(0, 16);

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
          className="control-bar-header-btn"
          style={{ marginLeft: 8 }}
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