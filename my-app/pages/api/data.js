import cookie from 'cookie';

export default async function handler(req, res) {
  // Get accessToken from cookies (server-side, httpOnly is fine)
  const cookies = cookie.parse(req.headers.cookie || '');
  const accessToken = cookies.accessToken || cookies.accessTokenJS || '';

  // Forward query params (limit, offset, etc)
  const { limit = 20, offset = 0 } = req.query;
  const url = `http://127.0.0.1:8080/v1/core/sensor_data/?limit=${limit}&offset=${offset}`;

  try {
    const apiRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
      },
    });
    const data = await apiRes.json();
    console.info("Sensor data response ----------------:", data);
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
}
