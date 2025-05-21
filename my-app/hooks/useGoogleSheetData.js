import { useEffect, useState } from 'react';

export default function useGoogleSheetData(sheetUrl) {
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  function fetchData() {
    fetch(sheetUrl)
      .then(res => res.ok ? res.text() : Promise.reject())
      .then(csv => {
        const [header, ...rows] = csv.trim().split('\n');
        const keys = header.split(',').map(k => k.trim().toLowerCase());
        const parsed = rows
          .map(row => {
            const vals = row.split(',');
            return Object.fromEntries(
              vals.map((v, i) => [
                keys[i],
                isNaN(Number(v)) || v.trim() === '' ? v : Number(v)
              ])
            );
          })
          .filter(row => row.time);
        setData(parsed);
      })
      .catch(() => setData([]));
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [sheetUrl]);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      fetchData();
      setRefreshing(false);
    }, 600);
  }

  return { data, setData, refreshing, handleRefresh };
}
