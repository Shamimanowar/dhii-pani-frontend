import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
