import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaShoppingCart,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Search from "./Search";
import "../css/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowMenu(false);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="logo-section">
            <img src="/logo.png" alt="Shopper Logo" className="logo" />
            <h1 className="brand-name">Shopper</h1>
          </Link>

          <div className="navbar-search">
            <Search />
          </div>

          <ul className="nav-links">
            <li className="nav-item">
              <Link to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/about">About Us</Link>
            </li>
            <li className="nav-item">
              <Link to="/contact">Contact Us</Link>
            </li>
          </ul>

          {/* Auth Buttons */}
          <div className="auth-section">
            {user ? (
              <>
                <Link to="/cart" className="cart-btn">
                  <FaShoppingCart /> Cart
                </Link>
                <div className="profile-menu">
                  <button
                    className="profile-btn"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <FaUser /> {user.displayName || "Profile"}
                  </button>
                  {showMenu && (
                    <div className="dropdown-menu">
                      <Link to="/profile" className="dropdown-item">
                        My Profile
                      </Link>
                      <Link to="/orders" className="dropdown-item">
                        My Orders
                      </Link>
                      <button
                        className="dropdown-item logout-item"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="login-btn">
                  <FaSignInAlt /> Login
                </Link>
                <Link to="/signup" className="signup-btn">
                  <FaUserPlus /> Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
