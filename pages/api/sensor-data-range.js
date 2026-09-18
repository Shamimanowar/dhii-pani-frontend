// Next.js API route to proxy sensor data range from backend
import { getApiBase } from "../../lib/apiBase";

export default async function handler(req, res) {
  try {
    const apiRes = await fetch(`${getApiBase()}/sensor-data-range/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
}
