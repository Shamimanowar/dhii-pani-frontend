"use client";
import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import cookie from 'cookie';

export default function Login() {
  const router = useRouter();
  const [phoneInput, setPhoneInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [cardVisible, setCardVisible] = useState(false);

  // Animate card entrance
  useEffect(() => {
    setTimeout(() => setCardVisible(true), 100);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (phoneInput && password) {
      try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phoneInput, password, is_staff: true }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      router.push('/data-table');
    } catch (err) {
      setError(err.message);
    }
      
    } else {
      setError('Invalid Phone or password');
      setTimeout(() => setError(''), 2000);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    }}>
      <style>{`
        .login-card-animate {
          opacity: 0;
          transform: translateY(40px) scale(0.98);
          transition: all 0.6s cubic-bezier(.23,1.01,.32,1);
        }
        .login-card-animate.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .login-input:focus {
          border: 1.5px solid #764ba2 !important;
          box-shadow: 0 0 0 2px #764ba230;
        }
        .login-btn:hover {
          background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 4px 16px rgba(118,75,162,0.13);
        }
        .login-error {
          animation: shake 0.4s;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }
        .login-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #764ba2;
          opacity: 0.7;
        }
        .login-input-wrapper {
          position: relative;
          width: 100%;
        }
        .show-pass-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #764ba2;
          font-size: 18px;
          opacity: 0.7;
        }
      `}</style>
      <div
        className={`login-card-animate${cardVisible ? ' visible' : ''}`}
        style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 18,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          padding: '44px 36px',
          width: 370,
          maxWidth: '90%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <h2 style={{
          marginBottom: 28,
          fontWeight: 800,
          fontSize: 34,
          color: '#4f3ca7',
          letterSpacing: 1
        }}>Welcome Back</h2>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="login-input-wrapper" style={{ marginBottom: 22 }}>
            <span className="login-icon">
              <svg width="20" height="20" fill="none"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 1116 0H2z" stroke="currentColor" strokeWidth="1.5"/></svg>
            </span>
            <input
              id="phone"
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              required
              className="login-input"
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 16,
                outline: 'none',
                transition: 'border 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
                background: '#f7f8fa'
              }}
              autoComplete="phone"
              placeholder="Phone number"
              // pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            />
          </div>
          <div className="login-input-wrapper" style={{ marginBottom: 22 }}>
            <span className="login-icon">
              <svg width="20" height="20" fill="none"><rect x="3" y="8" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5"/></svg>
            </span>
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="login-input"
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 16,
                outline: 'none',
                transition: 'border 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
                background: '#f7f8fa'
              }}
              autoComplete="current-password"
              placeholder="Password"
            />
            <button
              type="button"
              className="show-pass-toggle"
              tabIndex={-1}
              onClick={() => setShowPass(v => !v)}
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? (
                <svg width="20" height="20" fill="none"><path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
              ) : (
                <svg width="20" height="20" fill="none"><path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" stroke="currentColor" strokeWidth="1.5"/><path d="M4 4l12 12" stroke="currentColor" strokeWidth="1.5"/></svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            className="login-btn"
            style={{
              width: '100%',
              padding: '13px 0',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(118,75,162,0.15)',
              transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s'
            }}
          >
            Login
          </button>
          {error && <div className="login-error" style={{
            color: '#e53e3e',
            marginTop: 18,
            textAlign: 'center',
            fontWeight: 600,
            background: '#fff0f0',
            borderRadius: 8,
            padding: '10px 0',
            letterSpacing: 0.5,
            fontSize: 15,
            boxShadow: '0 2px 8px #e53e3e10'
          }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}