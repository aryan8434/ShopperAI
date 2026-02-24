import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaArrowLeft, FaTimes } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { toast } from "../components/Toast";
import "../css/WishlistPage.css";

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist } = useWishlist();

  const handleRemove = async (item) => {
    await removeFromWishlist(item.id);
    toast.info(`${item.name} removed from wishlist`);
  };

  return (
    <div className="wl-page">
      <div className="wl-header">
        <button className="wl-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="wl-title"><FaHeart className="wl-heart-icon" /> My Wishlist</h1>
        <span className="wl-count">{wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}</span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="wl-empty">
          <FaHeart className="wl-empty-icon" />
          <h2>Your wishlist is empty</h2>
          <p>Browse products and tap ❤️ to save them here</p>
          <button className="wl-browse-btn" onClick={() => navigate("/")}>Browse Products</button>
        </div>
      ) : (
        <div className="wl-grid">
          {wishlistItems.map(item => (
            <div key={item.id} className="wl-card" onClick={() => navigate(`/product/${item.id}`)}>
              <img src={item.image} alt={item.name} className="wl-img" />
              <button
                className="wl-remove-btn"
                title="Remove from wishlist"
                onClick={e => { e.stopPropagation(); handleRemove(item); }}
              >
                <FaTimes />
              </button>
              <div className="wl-card-info">
                <div className="wl-item-name">{item.name}</div>
                <div className="wl-item-cat">{item.category}</div>
                <div className="wl-item-price">₹{item.price?.toLocaleString("en-IN")}</div>
                <button
                  className="wl-add-cart"
                  onClick={e => { e.stopPropagation(); navigate(`/product/${item.id}`); }}
                >
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

export default Wishlist;
