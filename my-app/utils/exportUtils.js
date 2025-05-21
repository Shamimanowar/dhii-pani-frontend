// CSV and Excel export helpers
export function exportCSV(data, filename = 'data-table.csv') {
  if (!data.length) return;
  const header = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(',')).join('\n');
  const csv = header + '\n' + rows;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function exportExcel(data, filename = 'data-table.xls') {
  if (!data.length) return;
  let table = '<table><tr>';
  Object.keys(data[0]).forEach(key => { table += `<th>${key}</th>`; });
  table += '</tr>';
  data.forEach(row => {
    table += '<tr>';
    Object.values(row).forEach(val => { table += `<td>${val}</td>`; });
    table += '</tr>';
  });
  table += '</table>';
  const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
