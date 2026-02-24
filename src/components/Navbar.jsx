import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaSignInAlt, FaUserPlus, FaShoppingCart, FaBell,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import Search from "./Search";
import "../css/Navbar.css";

const SEEN_KEY = "shopper_seen_statuses";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const menuRef = React.useRef(null);

  // ── Order notification badge ──────────────────────────────────
  useEffect(() => {
    if (!user) { setNotifCount(0); return; }
    const q = query(collection(db, "users", user.uid, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
      let count = 0;
      snap.docs.forEach(doc => {
        const d = doc.data();
        const key = `${doc.id}_${d.status}`;
        if (!seen[key] && d.status && d.status !== "processing") count++;
      });
      setNotifCount(count);
    });
    return unsub;
  }, [user]);

  const clearNotifs = () => {
    // Called when user visits /orders (mark all as seen)
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "orders"));
    // We'll just clear badge on navigate
    setNotifCount(0);
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try { await logout(); setShowMenu(false); navigate("/"); }
    catch (e) { console.error(e); }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <a href="/" className="logo-section" style={{ textDecoration: "none" }}>
            <img src="/logo.png" alt="Shopper Logo" className="logo" />
            <h1 className="brand-name">Shopper</h1>
          </a>

          <div className="navbar-search"><Search /></div>

          <ul className="nav-links">
            <li className="nav-item"><a href="/">Home</a></li>
            <li className="nav-item"><a href="/about">About Us</a></li>
            <li className="nav-item"><a href="/contact">Contact Us</a></li>
          </ul>

          <div className="auth-section">
            {user ? (
              <>
                <a href="/cart" className="cart-btn"><FaShoppingCart /> Cart</a>
                <div className="profile-menu" ref={menuRef}>
                  <button className="profile-btn" onClick={() => setShowMenu(!showMenu)}>
                    <FaUser />
                    {user.displayName || "Profile"}
                    {notifCount > 0 && (
                      <span className="notif-badge">{notifCount > 9 ? "9+" : notifCount}</span>
                    )}
                  </button>
                  {showMenu && (
                    <div className="dropdown-menu">
                      <a href="/profile" className="dropdown-item">My Profile</a>
                      <a href="/orders" className="dropdown-item" onClick={clearNotifs}>
                        My Orders
                        {notifCount > 0 && <span className="dropdown-badge">{notifCount}</span>}
                      </a>
                      <a href="/wishlist" className="dropdown-item">❤️ Wishlist</a>
                      <a href="/recently-viewed" className="dropdown-item">🕐 Recently Viewed</a>
                      <button className="dropdown-item logout-item" onClick={handleLogout}>Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <a href="/login" className="login-btn"><FaSignInAlt /> Login</a>
                <a href="/signup" className="signup-btn"><FaUserPlus /> Sign Up</a>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
