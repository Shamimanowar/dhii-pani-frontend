"use client";
import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import cookie from 'cookie';
import '../css/login.css';

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
    <div className="login-bg">
      <div className={`login-card-animate${cardVisible ? ' visible' : ''} login-card`}>
        <h2 className="login-title">Welcome Back</h2>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="login-input-wrapper">
            <span className="login-icon">
              <svg width="20" height="20" fill="none"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 1116 0H2z" stroke="currentColor" strokeWidth="1.5"/></svg>
            </span>
            <input
              id="phone"
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              required
              className="login-input"
              autoComplete="phone"
              placeholder="Phone number"
            />
          </div>
          <div className="login-input-wrapper">
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
          >
            Login
          </button>
          {error && <div className="login-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}