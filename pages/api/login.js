import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { phone, password } = req.body;
      const response = await fetch("http://127.0.0.1:8080/v1/core/auth/jwt/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      
      // Assuming the response contains an access token
      const accessToken = data.access;

      // Set token and factory in HttpOnly cookies (must be set as an array to avoid overwriting)
      res.setHeader("Set-Cookie", [
        cookie.serialize("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env?.NODE_ENV !== "development",
          maxAge: 60 * 60 * 24 * 5, // 5 day
          sameSite: "strict",
          path: "/",
        }),
        cookie.serialize("factory", data.factory, {
          httpOnly: false,
          secure: process.env?.NODE_ENV !== "development",
          maxAge: 60 * 60 * 24 * 5, // 5 day
          sameSite: "strict",
          path: "/",
        })
      ]);
      
      res.status(200).json({ message: "Login successful" });
    } catch (error) {
      res.status(401).json({ error: "Authentication failed" });
    }
  }
    else if (req.method === "DELETE") {
    // Logout: Clear cookies
    res.setHeader("Set-Cookie", [
      cookie.serialize("accessToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 0, // Expire immediately
        path: "/",
      }),
      cookie.serialize("factory", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 0, // Expire immediately
        path: "/",
      })
    ]);
    res.status(200).json({ message: "Logged out successfully" });

    }

  else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}