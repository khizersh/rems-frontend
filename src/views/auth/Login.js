import { MainContext } from "context/MainContext";
import React, { useContext, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import httpService from "utility/httpService";
import { FEATURE_ALIASES, resolveHomepageByRole } from "utility/RolesConfig";
import "../../assets/styles/custom/login.css";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [forgotData, setForgotData] = useState({ email: "" });
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [sendBtnName, setSendBtnName] = useState("Send reset link");
  const [isSendDisabled, setIsSendDisabled] = useState(false);

  const { loading, setLoading, notifySuccess, notifyError } =
    useContext(MainContext);
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isForgotPassword) setForgotData((prev) => ({ ...prev, [name]: value }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await httpService.post("/user/login", {
        username: formData.email,
        password: formData.password,
      });

      const { token, sidebar, organization, role } = res.data || {};

      if (!token) throw new Error("Invalid login response");

      localStorage.setItem("token", token);
      localStorage.setItem("roles", JSON.stringify(role || []));
      localStorage.setItem("sidebar", JSON.stringify(sidebar || []));
      localStorage.setItem("organization", JSON.stringify(organization));

      notifySuccess(res.responseMessage, 3000);

      const homePath = resolveHomepageByRole(role);

      console.log("role", role);
      console.log("homePath", homePath);

      history.replace(homePath);
    } catch (err) {
      notifyError(err.message || "Login failed", err.data, 4000);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotData.email) return setError("Please enter valid email.");
    setLoading(true);
    setError("");
    setIsSendDisabled(true);

    try {
      const data = await httpService.get(
        `/user/send-reset-link/${forgotData.email}`
      );

      notifySuccess(data.responseMessage || "Password reset email sent!", 3000);

      setTimeout(() => {
        setIsSendDisabled(false);
        setSendBtnName("Didn't get the reset link? Resend");
      }, 20000);
    } catch (err) {
      notifyError(err.message || "Failed to send reset email", err.data, 4000);
      setError("Email not found");
      setIsSendDisabled(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        {/* Left Brand Panel */}
        <div className="login-brand-panel">
          <div className="login-brand-content">
            <div className="login-brand-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
                <path d="M9 9v.01" />
                <path d="M9 12v.01" />
                <path d="M9 15v.01" />
                <path d="M9 18v.01" />
              </svg>
            </div>
            <h1>REMS</h1>
            <p className="login-brand-subtitle">
              Real Estate Management System
            </p>

            <div className="login-brand-features">
              <div className="login-brand-feature-item">
                <span className="feature-icon">
                  <i className="fas fa-building"></i>
                </span>
                <span>Property Management</span>
              </div>
              <div className="login-brand-feature-item">
                <span className="feature-icon">
                  <i className="fas fa-chart-line"></i>
                </span>
                <span>Sales & Revenue Tracking</span>
              </div>
              <div className="login-brand-feature-item">
                <span className="feature-icon">
                  <i className="fas fa-warehouse"></i>
                </span>
                <span>Inventory & Warehouse</span>
              </div>
              <div className="login-brand-feature-item">
                <span className="feature-icon">
                  <i className="fas fa-chart-pie"></i>
                </span>
                <span>Analytics Dashboard</span>
              </div>
            </div>

            <div className="login-brand-divider"></div>
            <p className="login-brand-quote">
              Streamline your real estate operations with powerful tools and
              insights.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="login-form-panel">
          <div className="login-form-header">
            <h2>{isForgotPassword ? "Reset Password" : "Welcome Back"}</h2>
            <p>
              {isForgotPassword
                ? "Enter your email to receive a reset link"
                : "Sign in to continue to your dashboard"}
            </p>
          </div>

          {!isForgotPassword ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="login-field-group">
                <label className="login-field-label">Username</label>
                <div className="login-input-wrapper">
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                  <span className="login-input-icon">
                    <i className="fas fa-user"></i>
                  </span>
                </div>
              </div>

              <div className="login-field-group">
                <label className="login-field-label">Password</label>
                <div className="login-input-wrapper">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                  <span className="login-input-icon">
                    <i className="fas fa-lock"></i>
                  </span>
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleForgotPassword();
              }}
            >
              <div className="login-field-group">
                <label className="login-field-label">Registered Email</label>
                <div className="login-input-wrapper">
                  <input
                    type="email"
                    name="email"
                    value={forgotData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                  />
                  <span className="login-input-icon">
                    <i className="fas fa-envelope"></i>
                  </span>
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading || isSendDisabled}
                style={
                  isSendDisabled
                    ? { opacity: 0.6, cursor: "not-allowed" }
                    : {}
                }
              >
                {loading ? "Sending..." : sendBtnName}
              </button>
            </form>
          )}

          <div className="login-links-row">
            {!isForgotPassword ? (
              <a
                href="#pablo"
                onClick={(e) => {
                  e.preventDefault();
                  setIsForgotPassword(true);
                  setError("");
                }}
                className="login-link"
              >
                Forgot password?
              </a>
            ) : (
              <a
                href="#pablo"
                onClick={(e) => {
                  e.preventDefault();
                  setIsForgotPassword(false);
                  setError("");
                }}
                className="login-link"
              >
                <i
                  className="fas fa-arrow-left"
                  style={{ marginRight: "6px", fontSize: "0.75rem" }}
                ></i>
                Back to login
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
