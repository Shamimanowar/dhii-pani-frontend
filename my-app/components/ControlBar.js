import React from "react";

const headerBtnStyle = {
  fontWeight: 700,
  fontSize: 16,
  border: "none",
  background: "linear-gradient(90deg, #6c63ff 0%, #667eea 100%)",
  color: "#fff",
  padding: "8px 20px",
  borderRadius: 8,
  cursor: "pointer",
  boxShadow: "0 2px 8px #6c63ff10",
  transition: "background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s",
  outline: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const exportDropdownItemStyle = {
  color: "#6c63ff",
  padding: "12px 18px",
  textDecoration: "none",
  display: "block",
  fontWeight: 600,
  fontSize: 15,
  background: "none",
  border: "none",
  width: "100%",
  textAlign: "left",
  cursor: "pointer",
  borderRadius: 8,
  transition: "background 0.2s",
};

const dateInputStyle = {
  border: "1.5px solid #ececff",
  borderRadius: 8,
  padding: "7px 10px",
  fontSize: 15,
  color: "#4f3ca7",
  background: "#f7f8fa",
  outline: "none",
  minWidth: 140,
  transition: "border 0.2s",
  margin: "0 6px",
};

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
    <div style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "12px 0 10px 0",
        }}
      >
        {/* Export Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            style={{ ...headerBtnStyle, minWidth: 110 }}
            onClick={() => setExportOpen((v) => !v)}
          >
            Export ▼
          </button>
          {exportOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                background: "#fff",
                minWidth: 140,
                boxShadow: "0 4px 16px #6c63ff22",
                borderRadius: 10,
                zIndex: 100,
                marginTop: 8,
                border: "1px solid #ececff",
              }}
            >
              <button
                style={exportDropdownItemStyle}
                onClick={() => {
                  exportCSV();
                  setExportOpen(false);
                }}
              >
                Export as CSV
              </button>
              <button
                style={exportDropdownItemStyle}
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
          style={dateInputStyle}
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
          style={dateInputStyle}
        />
        {/* Filter Metric Dropdown */}
        <select
          value={filterMetric}
          onChange={(e) => setFilterMetric(e.target.value)}
          style={{
            border: "1.5px solid #ececff",
            borderRadius: 8,
            padding: "7px 14px",
            fontSize: 15,
            color: "#4f3ca7",
            background: "#f7f8fa",
            outline: "none",
            minWidth: 140,
            transition: "border 0.2s",
          }}
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
          style={{ ...headerBtnStyle, width: 130, height: 36 }}
          onClick={handleRefresh}
        >
          {loading ? (
            <span
              className="dt-refresh-anim"
              style={{ display: "inline-block" }}
            >
              ⟳
            </span>
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