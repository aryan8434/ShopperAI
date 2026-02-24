import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaArrowLeft, FaTrash } from "react-icons/fa";
import "../css/WishlistPage.css";

const RecentlyViewed = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("shopper_recent") || "[]"));
    } catch { setItems([]); }
  }, []);

  const clearAll = () => {
    localStorage.removeItem("shopper_recent");
    setItems([]);
  };

  return (
    <div className="wl-page">
      <div className="wl-header">
        <button className="wl-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="wl-title"><FaClock className="wl-heart-icon" style={{ color: "#667eea" }} /> Recently Viewed</h1>
        {items.length > 0 && (
          <button className="wl-clear-btn" onClick={clearAll}>
            <FaTrash /> Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="wl-empty">
          <FaClock className="wl-empty-icon" style={{ color: "#667eea" }} />
          <h2>No recently viewed products</h2>
          <p>Products you browse will appear here</p>
          <button className="wl-browse-btn" onClick={() => navigate("/")}>Start Browsing</button>
        </div>
      ) : (
        <div className="wl-grid">
          {items.map(item => (
            <div key={item.id} className="wl-card" onClick={() => navigate(`/product/${item.id}`)}>
              <img src={item.image} alt={item.name} className="wl-img" />
              <div className="wl-card-info">
                <div className="wl-item-name">{item.name}</div>
                <div className="wl-item-cat">{item.category}</div>
                <div className="wl-item-price">₹{item.price?.toLocaleString("en-IN")}</div>
                <button className="wl-add-cart" onClick={e => { e.stopPropagation(); navigate(`/product/${item.id}`); }}>
                  View Product
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentlyViewed;
