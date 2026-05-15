import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate,useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "../styles/Navigation.css";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout?.();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const navItems = [
    { to: "/dashboard", label: "Analyze" },
    { to: "/history", label: "My Resumes" },
    { to: "/ai-features", label: "AI Tools" },
  ];

  return (
    <>
      
      <nav className="nav-root">
        <div className="nav-inner">
          {/* Left: Logo */}
          <div className="nav-logo" onClick={() => navigate("/")}>
            <div className="nav-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
            </div>
            <span className="nav-logo-text">Resume<span>Analyzer</span></span>
          </div>

          <div className="nav-links">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={(e)=>{
                  if(location.pathname === item.to){
                    e.preventDefault();
                  }
                }}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right: User */}
          <div className="nav-right">
            <div className="nav-user-wrapper" ref={dropdownRef}>
              <button
                className="nav-avatar-btn"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-label="User menu"
              >
                {initials}
                <span className="nav-online-dot" />
              </button>

              <div className={`nav-dropdown ${dropdownOpen ? "open" : ""}`}>
                <div className="nav-dropdown-user">
                  <div className="nav-dropdown-name">{user?.name || "User"}</div>
                  <div className="nav-dropdown-email">{user?.email || ""}</div>
                </div>

         

                <div className="nav-divider" />

                <button className="nav-dropdown-item danger" onClick={handleLogout}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
