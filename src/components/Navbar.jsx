import React from "react";
import { NavLink } from "react-router-dom";
import "../Components.Styles/Navbar.css";

const Navbar = () => {
  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/tasks", label: "Tasks", icon: "📋" },
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="brand">
          <div className="brand-logo">AI</div>
          <div className="brand-text">
            <div className="brand-name">DecisionAI</div>
            <div className="brand-sub">AI-ASSISTED</div>
          </div>
        </div>

        <div className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-item-active" : ""}`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="input-wrapper">
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search tasks..."
                className="input-field"
              />
              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "8px",
                  color: "#9ca3af",
                }}
              >
                🔍
              </span>
            </div>
          </div>

          <div className="ai-group" style={{ position: "relative" }}>
            <div className="ai-button">🤖</div>
            <div className="ai-tooltip">
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#1f2937",
                }}
              >
                AI Assistant
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  marginTop: "4px",
                }}
              >
                Active • Ready to help
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#7c3aed",
                  marginTop: "8px",
                  fontWeight: 500,
                }}
              >
                💡 3 new insights available
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
