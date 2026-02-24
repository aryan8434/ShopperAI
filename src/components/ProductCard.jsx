import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaHeart, FaRegHeart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { addToCart, getCart, updateCartQuantity } from "../services/CartService";
import { useNavigate } from "react-router-dom";
import { toast } from "./Toast";

const ProductCard = ({ product, onCartUpdate, showNotification }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist() || {};
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  const wishlisted = isWishlisted?.(product.id) ?? false;

  useEffect(() => {
    if (user) checkProductInCart();
  }, [user, product.id]);

  const checkProductInCart = async () => {
    try {
      const cartItems = await getCart(user.uid);
      const cartItem = cartItems.find((item) => item.productId === product.id);
      setQuantity(cartItem ? cartItem.quantity : 0);
    } catch { setQuantity(0); }
  };

  const handleAddToCart = async () => {
    if (!user) { navigate("/login"); return; }
    setLoading(true);
    try {
      const result = await addToCart(user.uid, product, 1);
      if (result.success) {
        setQuantity(1);
        toast.success(`${product.name} added to cart!`);
        onCartUpdate?.();
      } else { toast.error(result.error || "Failed to add"); }
    } catch { toast.error("Failed to add to cart"); }
    finally { setLoading(false); }
  };

  const handleIncrease = async () => {
    const newQ = quantity + 1;
    setQuantity(newQ); // optimistic
    try {
      const result = await updateCartQuantity(user.uid, product.id, newQ);
      if (!result.success) setQuantity(quantity);
    } catch { setQuantity(quantity); }
  };

  const handleDecrease = async () => {
    const newQ = quantity - 1;
    setQuantity(newQ); // optimistic
    if (newQ <= 0) {
      try { await updateCartQuantity(user.uid, product.id, 0); onCartUpdate?.(); }
      catch { setQuantity(1); }
      return;
    }
    try {
      const result = await updateCartQuantity(user.uid, product.id, newQ);
      if (!result.success) setQuantity(quantity);
    } catch { setQuantity(quantity); }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    if (wishlisted) {
      await removeFromWishlist(product.id);
      toast.info("Removed from wishlist");
    } else {
      await addToWishlist(product);
      toast.success("Saved to wishlist ❤️");
    }
  };

  return (
    <div className="product-showcase-card">
      {/* Image + heart */}
      <div className="product-image" onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: "pointer", position: "relative" }}>
        <img src={product.image} alt={product.name} />
        <button className={`pc-heart-btn ${wishlisted ? "pc-heart-active" : ""}`} onClick={handleWishlist} title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}>
          {wishlisted ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <div className="product-details">
        <h3 onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: "pointer" }}>{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-description">{product.description}</p>
        <p className="product-price">₹{product.price.toLocaleString("en-IN")}</p>

        {quantity === 0 ? (
          <button className="add-btn" onClick={handleAddToCart} disabled={loading}>
            {user ? (loading ? "Adding…" : "Add to Cart") : "Login to Buy"}
          </button>
        ) : (
          <div className="quantity-controls">
            <button className="qty-btn minus" onClick={handleDecrease} title="Remove"><FaMinus /></button>
            <span className="qty-display">{quantity}</span>
            <button className="qty-btn plus"  onClick={handleIncrease} title="Add more"><FaPlus /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
