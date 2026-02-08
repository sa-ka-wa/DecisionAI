// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "../Pages.Styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simple validation
      if (!formData.email || !formData.password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      console.log("Attempting login...");

      // Call login API
      const response = await api.login(formData.email, formData.password);

      console.log("Login response:", response);

      if (response.success) {
        console.log("Login successful, redirecting...");
        // Redirect to home page
        navigate("/");
        window.location.reload(); // Refresh to update auth state
      } else {
        setError(
          response.message || "Login failed. Please check your credentials.",
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Demo account for easy testing
  const handleDemoLogin = () => {
    setFormData({
      email: "test2@example.com",
      password: "password123",
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="brand">
              <div className="brand-logo">AI</div>
              <div className="brand-text">
                <div className="brand-name">DecisionAI</div>
                <div className="brand-sub">AI-ASSISTED</div>
              </div>
            </div>
            <h1>Welcome Back</h1>
            <p className="login-subtitle">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="error-alert">
              <div className="error-icon">⚠️</div>
              <div className="error-message">{error}</div>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="demo-section">
              <p className="demo-text">For testing purposes:</p>
              <button
                type="button"
                className="demo-button"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                Use Demo Account
              </button>
            </div>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="register-link">
              Don't have an account?{" "}
              <Link to="/register" className="register-button">
                Create account
              </Link>
            </div>
          </form>

          <div className="login-footer">
            <p className="footer-text">
              By continuing, you agree to our <a href="#">Terms of Service</a>{" "}
              and <a href="#">Privacy Policy</a>
            </p>
          </div>
        </div>

        <div className="login-illustration">
          <div className="illustration-content">
            <div className="illustration-icon">🤖</div>
            <h2>AI-Powered Task Management</h2>
            <p>
              Make better decisions with AI-assisted task prioritization and
              intelligent insights.
            </p>
            <div className="features-list">
              <div className="feature">
                <span className="feature-icon">🎯</span>
                <span>Smart Prioritization</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📊</span>
                <span>Analytics Dashboard</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <span>Real-time Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
