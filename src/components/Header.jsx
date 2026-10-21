// src/components/Header.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Home, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { normalizeUrl } from "../config";
import SearchBox from "./SearchBox";
import { getInitials } from "../utils/format";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { openLogin, openSignup } = useUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Click ra ngoài -> đóng dropdown (em xử lý chỗ này)
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </Link>
        <Link to="/" className="round-btn" title="Trang chủ">
          <Home size={22} />
        </Link>
        <SearchBox />
      </div>

      <div className="header-right">
        {isAuthenticated ? (
          <div className="user-menu" ref={menuRef}>
            <button className="user-btn" onClick={() => setMenuOpen((v) => !v)}>
              {user.avatar_url ? (
                <img
                  className="avatar"
                  src={normalizeUrl(user.avatar_url)}
                  alt=""
                />
              ) : (
                <span className="avatar-fallback">
                  {getInitials(user.display_name || user.username)}
                </span>
              )}
              <span className="user-name">
                {user.display_name || user.username}
              </span>
            </button>
            {menuOpen && (
              <div className="dropdown">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="btn btn-text" onClick={openSignup}>
              Sign up
            </button>
            <button className="btn btn-white" onClick={openLogin}>
              Log in
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
