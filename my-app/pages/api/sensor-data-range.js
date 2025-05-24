// Next.js API route to proxy sensor data range from backend
// Use environment variable for backend API endpoint
const API_ENDPOINT = process.env.API_ENDPOINT || 'http://127.0.0.1:8080/v1/core';

export default async function handler(req, res) {
  try {
    const apiRes = await fetch(`${API_ENDPOINT}/sensor-data-range/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
}
