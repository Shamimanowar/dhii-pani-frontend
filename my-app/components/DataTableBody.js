import React from 'react';
import { isOutOfRange } from '../utils/columnLimits';
import '../css/data-table-body.css';

export default function DataTableBody({ data, refreshing, tdStyle }) {
  return (
    <tbody>
      {data.map((row, i) => (
        <tr
          key={i}
          className={`data-table-row ${i % 2 === 0 ? 'even' : 'odd'}${refreshing ? '' : ' dt-row-anim'}`}
          onMouseEnter={e => e.currentTarget.classList.add('hover')}
          onMouseLeave={e => e.currentTarget.classList.remove('hover')}
        >
          <td className="data-table-td">{row.time}</td>
          <td className={`data-table-td${isOutOfRange('temp', row.temp) ? ' out-of-range' : ''}`}>{row.temp}</td>
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
