import React from 'react';
import '../css/data-table-body.css';

export default function DataTableBody({ data, refreshing, limits = {} }) {
  
  const isOutOfRange = (metric, value) => {
      const lim = limits[metric];
      if (!lim || value === undefined || value === null || value === "") return false;
      if (lim.min !== undefined && value < lim.min) return true;
      if (lim.max !== undefined && value > lim.max) return true;
      return false;
    }

    function formatDateTime(dt) {
      if (!dt) return '';
      const date = new Date(dt);
      if (isNaN(date.getTime())) return dt;
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).replace(',', ',').replace('AM', 'a.m.').replace('PM', 'p.m.');
    }
  return (
    <tbody>
      {data.map((row, i) => (
        <tr
          key={i}
          className={`data-table-row ${i % 2 === 0 ? 'even' : 'odd'}${refreshing ? '' : ' dt-row-anim'}`}
          onMouseEnter={e => e.currentTarget.classList.add('hover')}
          onMouseLeave={e => e.currentTarget.classList.remove('hover')}
        >
          <td className="data-table-td">{formatDateTime(row.timestamp)}</td>
          <td className={`data-table-td${isOutOfRange('temp', row.temperature) ? ' out-of-range' : ''}`}>{row.temperature}</td>
          <td className={`data-table-td${isOutOfRange('bod', row.bod) ? ' out-of-range' : ''}`}>{row.bod}</td>
          <td className={`data-table-td${isOutOfRange('cod', row.cod) ? ' out-of-range' : ''}`}>{row.cod}</td>
          <td className={`data-table-td${isOutOfRange('ph', row.ph) ? ' out-of-range' : ''}`}>{row.ph}</td>
          <td className={`data-table-td${isOutOfRange('tds', row.tds) ? ' out-of-range' : ''}`}>{row.tds}</td>
          <td className={`data-table-td${isOutOfRange('do', row.do) ? ' out-of-range' : ''}`}>{row.do}</td>
          <td className={`data-table-td${isOutOfRange('color', row.color) ? ' out-of-range' : ''}`}>{row.color}</td>
          <td className={`data-table-td${isOutOfRange('tss', row.tss) ? ' out-of-range' : ''}`}>{row.tss}</td>
        </tr>
      ))}
    </tbody>
  );
}
