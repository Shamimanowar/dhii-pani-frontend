import React from "react";
import '../css/control-bar.css';

const ControlBar = ({
  exportOpen,
  setExportOpen,
  exportCSV,
  exportJSON,
  dateRange,
  fullRange,
  handleDateChange,
  filterMetric,
  setFilterMetric,
  COLUMN_LABELS,
  handleRefresh,
  loading
}) => {
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
              <button
                className="control-bar-export-item"
                onClick={() => {
                  exportCSV();
                  setExportOpen(false);
                }}
              >
                Export as CSV
              </button>
              <button
                className="control-bar-export-item"
                onClick={() => {
                  exportJSON();
                  setExportOpen(false);
                }}
              >
                Export as JSON
              </button>
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