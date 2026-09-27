import React, { useState } from 'react';
import { Database, User, Lock, Eye, EyeOff, Check, ArrowRight, Shield, UserCheck } from 'lucide-react';
import { authenticateCredentials } from '../utils/jwtAuth';

export function LoginScreen({ onLogin, employees = [] }) {
  const [userId, setUserId] = useState('ariz17');
  const [password, setPassword] = useState('arbab786');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      const auth = authenticateCredentials({
        userId: 'ariz17',
        password: 'arbab786',
        employees
      });
      if (auth.success) {
        onLogin({ token: auth.token, user: auth.user });
      }
    } else {
      const auth = authenticateCredentials({
        userId: '100101',
        password: 'password123',
        employees
      });
      if (auth.success) {
        onLogin({ token: auth.token, user: auth.user });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!userId.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }

    const auth = authenticateCredentials({
      userId: userId.trim(),
      password: password.trim(),
      employees
    });

    if (auth.success) {
      onLogin({ token: auth.token, user: auth.user });
    } else {
      setError(auth.error || 'Invalid credentials. Use Quick Demo buttons above.');
    }
  };

  return (
    <div className="login-page-bg">
      <div className="login-card-container">
        {/* Left Side: Brand Panel (Matches Screenshot 5) */}
        <div className="login-brand-panel">
          <div className="login-brand-icon-box">
            <Database size={32} />
          </div>

          <h1 className="login-brand-title">
            SAP Workforce<br />Management System
          </h1>

          <p className="login-brand-desc">
            Connecting enterprise workforce operations, department analytics, and leave approvals through one secure SAP RAP platform.
          </p>

          <div className="login-features-list">
            <div className="login-feature-item">
              <span className="feature-check-icon">
                <Check size={14} />
              </span>
              <span>Enterprise RAP Object <code>ZC_EMPLOYEE_DETAILS</code></span>
            </div>

            <div className="login-feature-item">
              <span className="feature-check-icon">
                <Check size={14} />
              </span>
              <span>Centralized real-time leave approval tracking</span>
            </div>

            <div className="login-feature-item">
              <span className="feature-check-icon">
                <Check size={14} />
              </span>
              <span>Role-based access & automated determinations</span>
            </div>
          </div>
        </div>

        {/* Right Side: Sign-In Form (Matches Screenshot 5) */}
        <div className="login-form-panel">
          <div className="login-form-header">
            <h2 className="login-welcome-title">Welcome Back</h2>
            <p className="login-welcome-subtitle">Sign in to access your account</p>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="login-demo-bar">
            <span className="demo-label">Interview Quick Demo:</span>
            <div className="demo-buttons-row">
              <button
                type="button"
                className="btn-demo-pill"
                onClick={() => handleQuickLogin('admin')}
              >
                <Shield size={12} />
                <span>HR Admin</span>
              </button>
              <button
                type="button"
                className="btn-demo-pill"
                onClick={() => handleQuickLogin('employee')}
              >
                <UserCheck size={12} />
                <span>Employee</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error-alert">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group-clean">
              <label htmlFor="login-username">Username</label>
              <div className="input-with-icon-wrap">
                <User size={16} className="input-icon" />
                <input
                  id="login-username"
                  type="text"
                  placeholder="Enter your username (e.g. ariz17 or 100101)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="clean-input with-left-icon"
                  required
                />
              </div>
            </div>

            <div className="form-group-clean">
              <label htmlFor="login-password">Password</label>
              <div className="input-with-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="clean-input with-left-icon with-right-btn"
                  required
                />
                <button
                  type="button"
                  className="input-right-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-login-submit"
            >
              <span>Sign In</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="login-footer-meta">
            <p>SAP Workforce Management System</p>
            <span>Managed ABAP RESTful Application Programming</span>
          </div>
        </div>
      </div>
    </div>
  );
}
