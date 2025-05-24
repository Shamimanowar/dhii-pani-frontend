import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f7fafc 0%, #e3e9f7 100%)',
      padding: 0,
    }}>
      <div style={{
        fontSize: 120,
        fontWeight: 900,
        color: '#345995',
        letterSpacing: 4,
        marginBottom: 0,
        textShadow: '0 2px 12px #e6e6e6',
      }}>
        404
      </div>
      <div style={{
        fontSize: 32,
        fontWeight: 700,
        color: '#222',
        marginBottom: 16,
      }}>
        Page Not Found
      </div>
      <div style={{
        fontSize: 18,
        color: '#666',
        marginBottom: 32,
        textAlign: 'center',
        maxWidth: 400,
      }}>
        Sorry, the page you are looking for does not exist or has been moved.<br />
        Please check the URL or return to the dashboard.
      </div>
      <Link href="/" style={{
          display: 'inline-block',
          background: '#345995',
          color: '#fff',
          fontWeight: 600,
          fontSize: 18,
          padding: '12px 32px',
          borderRadius: 8,
          textDecoration: 'none',
          boxShadow: '0 2px 8px 0 #e6e6e6',
          transition: 'background 0.2s',
        }}>
        <span 
        >
          Go Home
        </span>
      </Link>
    </div>
  );
}
