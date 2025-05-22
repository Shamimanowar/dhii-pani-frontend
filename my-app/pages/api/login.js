import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { phone, password, is_staff } = req.body;
      const response = await fetch("http://127.0.0.1:8080/v1/core/auth/jwt/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
          is_staff,
        }),
      });

      const data = await response.json();
      console.info("Login response ----------------:", data);
      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      
      // Assuming the response contains an access token
      const accessToken = data.access;

      // Set token in HttpOnly cookie
      res.setHeader("Set-Cookie", cookie.serialize("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env?.NODE_ENV !== "development",
        maxAge: 60 * 60 * 24, // 1 day
        sameSite: "strict",
        path: "/",
      }));

      res.status(200).json({ message: "Login successful" });
    } catch (error) {
      res.status(401).json({ error: "Authentication failed" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}