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
  title: "DHII - ETP Monitoring Dashboard",
  keywords: [
    "ETP",
    "Monitoring",
    "Dashboard",
    "Software Engineer",
    "SHAMIM ANOWAAR",
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
  creator: "Shamim Anowar",
  openGraph: {
    title: "DHII - ETP Monitoring Dashboard",
    description:
      "ETP Monitoring Dashboard for Textile Industries in Bangladesh",
    url: "https://invenshape.com/",
    siteName: "DHII ETP Monitoring",
    images: [
      {
        url: "/dhi_logo.jpg",
        width: 1200,
        height: 630,
        alt: "ETP Monitoring Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
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
