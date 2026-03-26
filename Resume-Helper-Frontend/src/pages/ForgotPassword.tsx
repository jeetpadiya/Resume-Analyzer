import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../service/api";
import "../styles/login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      setResetLink("");

      const res = await API.post("/user/forgot-password", { email });
      setMessage(res.data.message || "Reset instructions generated");

      if (res.data.resetUrl) {
        setResetLink(res.data.resetUrl);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to start password reset");
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
        <h1 className="login-title">Forgot password</h1>
        <p className="login-subtitle">Enter your email and we will generate a reset link.</p>

        {error && <div className="login-error">{error}</div>}
        {message && <div className="login-error" style={{ color: "#9ff7d3", borderColor: "rgba(64, 210, 140, 0.25)", background: "rgba(21, 78, 55, 0.18)" }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className={`field-group ${focused === "email" ? "active" : ""}`}>
            <label className="field-label">Email address</label>
            <div className="field-wrapper">
              <input
                type="email"
                placeholder="you@example.com"
                className="field-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
              />
              <span className="field-line" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            <span className="btn-content">
              {loading ? <><span className="spinner" />Generating...</> : "Generate reset link"}
            </span>
          </button>
        </form>

        {resetLink && (
          <p className="login-footer" style={{ marginTop: "18px" }}>
            Reset link: <Link to={resetLink}>{resetLink}</Link>
          </p>
        )}

        <p className="login-footer">
          Remembered it? <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
