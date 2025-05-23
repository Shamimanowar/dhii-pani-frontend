import cookie from "cookie";

export default async function handler(req, res) {
  console.log("[Proxy] Incoming request:", {
    method: req.method,
    url: req.url,
    headers: req.headers,
    cookies: req.headers.cookie
  });

  if (req.method === "GET") {
    try {
      // Parse cookies from the request
      const cookies = cookie.parse(req.headers.cookie || "");
      const accessToken = cookies.accessToken || cookies.accessTokenJS || "";
      console.log("[Proxy] Parsed accessToken:", accessToken);

      // Forward query params
      const { limit = 20, offset = 0 } = req.query;
      const url = `http://127.0.0.1:8080/v1/core/sensor_data/?limit=${limit}&offset=${offset}`;
      console.log("[Proxy] Forwarding to backend URL:", url);

      // Forward the request to the backend
      const backendHeaders = {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {})
      };
      console.log("[Proxy] Backend request headers:", backendHeaders);

      let apiRes;
      try {
        apiRes = await fetch(url, {
          method: "GET",
          headers: backendHeaders,
        });
      } catch (fetchErr) {
        console.error("[Proxy] Error during fetch to backend:", fetchErr);
        return res.status(502).json({ error: "Failed to reach backend", detail: fetchErr.message });
      }

      let data;
      try {
        data = await apiRes.json();
      } catch (jsonErr) {
        console.error("[Proxy] Error parsing backend response as JSON:", jsonErr);
        return res.status(502).json({ error: "Invalid JSON from backend", detail: jsonErr.message });
      }

      console.log("[Proxy] Backend response status:", apiRes.status);
      res.status(apiRes.status).json(data);
    } catch (error) {
      console.error("[Proxy] Unexpected error:", error);
      res.status(500).json({ error: "Proxy error", detail: error.message });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
