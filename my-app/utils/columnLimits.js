// Column limits and isOutOfRange helper
export const COLUMN_LIMITS = {
  temp: { min: 25, max: 30 },
  bod: { max: 30 },
  cod: { max: 200 },
  ph: { min: 6, max: 9 },
  tds: { max: 2100 },
  do: { min: 4.5, max: 8 },
  color: { max: 150 },
  tss: { max: 100 }
};

export function isOutOfRange(key, value) {
  const lim = COLUMN_LIMITS[key];
  if (!lim || value === undefined || value === null || value === '') return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (lim.min !== undefined && Number(value) < lim.min) return true;
  if (lim.max !== undefined && Number(value) > lim.max) return true;
  return false;
}
