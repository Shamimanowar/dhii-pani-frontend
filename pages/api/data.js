import * as cookie from "cookie";

// Use environment variable for backend API endpoint
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || 'http://app:8000/v1/core';

export default async function handler(req, res) {
  // Get accessToken from cookies (server-side, httpOnly is fine)
  const cookies = cookie.parse(req.headers.cookie || '');
  const accessToken = cookies.accessToken || cookies.accessTokenJS || '';

  // Forward all query params (including timestamp_from, timestamp_to, etc)
  const params = new URLSearchParams(req.query).toString();
  // Use env-based endpoint
  const url = `${API_ENDPOINT}/sensor_data/?${params}`;

  try {
    const apiRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
      },
    });
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
}
