import React from 'react';
import { isOutOfRange } from '../utils/columnLimits';

export default function DataTableBody({ data, refreshing, tdStyle }) {
  return (
    <tbody>
      {data.map((row, i) => (
        <tr
          key={i}
          className={refreshing ? '' : 'dt-row-anim'}
          style={{
            background: i % 2 === 0 ? '#f8f9fc' : '#fff',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e6eaff'}
          onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#f8f9fc' : '#fff'}
        >
          <td style={tdStyle}>{row.time}</td>
          <td style={{ ...tdStyle, background: isOutOfRange('temp', row.temp) ? '#ffeaea' : '#fff' }}>{row.temp}</td>
          <td style={{ ...tdStyle, background: isOutOfRange('bod', row.bod) ? '#ffeaea' : '#fff' }}>{row.bod}</td>
          <td style={{ ...tdStyle, background: isOutOfRange('cod', row.cod) ? '#ffeaea' : '#fff' }}>{row.cod}</td>
          <td style={{ ...tdStyle, background: isOutOfRange('ph', row.ph) ? '#ffeaea' : '#fff' }}>{row.ph}</td>
          <td style={{ ...tdStyle, background: isOutOfRange('tds', row.tds) ? '#ffeaea' : '#fff' }}>{row.tds}</td>
          <td style={{ ...tdStyle, background: isOutOfRange('do', row.do) ? '#ffeaea' : '#fff' }}>{row.do}</td>
          <td style={{ ...tdStyle, background: isOutOfRange('color', row.color) ? '#ffeaea' : '#fff' }}>{row.color}</td>
          <td style={{ ...tdStyle, background: isOutOfRange('tss', row.tss) ? '#ffeaea' : '#fff' }}>{row.tss}</td>
        </tr>
      ))}
    </tbody>
  );
}
