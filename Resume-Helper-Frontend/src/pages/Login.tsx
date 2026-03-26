import { useState, useEffect } from "react";
import API from "../service/api";
import { useAuth } from "../Context/AuthContext";
import { useNavigate,Link } from "react-router-dom";
import "../styles/login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/user/login", { email, password });
      const { token, user } = res.data;

      login(token, user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="login-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="grid-overlay" />

        <div className={`login-card ${mounted ? "visible" : ""}`}>
          <p className="login-eyebrow">Welcome back</p>
          <h1 className="login-title">Sign in</h1>
          <p className="login-subtitle">Enter your credentials to continue</p>

          {error && (
            <div className="login-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
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

            <div className={`field-group ${focused === "password" ? "active" : ""}`}>
              <label className="field-label">Password</label>
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

            <div style={{ textAlign: "right", marginTop: "-6px", marginBottom: "4px" }}>
              <Link to="/forgot-password" style={{ fontSize: "12px", color: "#a48fff", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              <span className="btn-content">
                {loading ? (
                  <>
                    <span className="spinner" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Continue
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="divider">
            <span className="divider-line" />
            <span className="divider-text">or</span>
            <span className="divider-line" />
          </div>

          <p className="login-footer">
            Don't have an account?{" "}
            <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;