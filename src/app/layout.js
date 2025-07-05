import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Inter", "system-ui", "-apple-system", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Monaco", "Consolas", "monospace"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"), // Ensure correct base URL
  title: "DHII - ETP Monitoring Dashboard",
  keywords: [
    "ETP",
    "Monitoring",
    "Dashboard",
    "Software Engineer",
    "SHAMIM ANOWAR",
    "Best Programmer",
    "Web Development",
    "Shamim",
    "Anowar",
    "Environment",
    "Water Treatment",
  ],
  description: "ETP Monitoring Dashboard for Textile Industries in Bangladesh",
  authors: [
    {
      name: "Shamim Anowar",
      url: "https://shm-port.netlify.app/",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
