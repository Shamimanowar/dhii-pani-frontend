// Helper to generate column label with range from limits object
export function getColumnLabelWithRange(label, metric, limits) {
  const lim = limits[metric];
  if (!lim) return label;
  // Prefer max if available, else min, else just label
  if (lim.max !== undefined && lim.min !== undefined) {
    return `${label} (${lim.min}–${lim.max})`;
  } else if (lim.max !== undefined) {
    return `${label} (${lim.max})`;
  } else if (lim.min !== undefined) {
    return `${label} (${lim.min})`;
  }
  return label;
}
