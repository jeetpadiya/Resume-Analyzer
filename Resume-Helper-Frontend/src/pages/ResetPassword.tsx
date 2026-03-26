import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../service/api";
import "../styles/login.css";

const ResetPassword = () => {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill both password fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.post("/user/reset-password", { token, password });
      setMessage(res.data.message || "Password reset successfully");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="grid-overlay" />

      <div className={`login-card ${mounted ? "visible" : ""}`}>
        <p className="login-eyebrow">Recovery</p>
        <h1 className="login-title">Reset password</h1>
        <p className="login-subtitle">Choose a new password for your account.</p>

        {error && <div className="login-error">{error}</div>}
        {message && <div className="login-error" style={{ color: "#9ff7d3", borderColor: "rgba(64, 210, 140, 0.25)", background: "rgba(21, 78, 55, 0.18)" }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className={`field-group ${focused === "password" ? "active" : ""}`}>
            <label className="field-label">New password</label>
            <div className="field-wrapper">
              <input
                type="password"
                placeholder="••••••••"
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
              />
              <span className="field-line" />
            </div>
          </div>

          <div className={`field-group ${focused === "confirmPassword" ? "active" : ""}`}>
            <label className="field-label">Confirm password</label>
            <div className="field-wrapper">
              <input
                type="password"
                placeholder="••••••••"
                className="field-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocused("confirmPassword")}
                onBlur={() => setFocused(null)}
              />
              <span className="field-line" />
            </div>
          </div>

          <button type="submit" disabled={loading || !token} className="login-btn">
            <span className="btn-content">
              {loading ? <><span className="spinner" />Resetting...</> : "Reset password"}
            </span>
          </button>
        </form>

        <p className="login-footer">
          Back to <Link to="/login">sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
