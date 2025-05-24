// Column limits and isOutOfRange helper
// export const COLUMN_LIMITS = {
//   temp: { min: 25, max: 45 },
//   bod: { max: 30 },
//   cod: { max: 200 },
//   ph: { min: 5, max: 9 },
//   tds: { max: 2100 },
//   do: { min: 4.5, max: 8 },
//   color: { max: 150 },
//   tss: {min:30, max: 100 }
// };

  // Helper to check if value is out of dynamic range
  export function isOutOfRange(metric, value) {
    const lim = limits[metric];
    if (!lim || value === undefined || value === null || value === "") return false;
    if (lim.min !== undefined && value < lim.min) return true;
    if (lim.max !== undefined && value > lim.max) return true;
    return false;
  }