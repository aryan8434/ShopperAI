import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import {
  addToCart,
  getCart,
  updateCartQuantity,
} from "../services/CartService";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, onCartUpdate, showNotification }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check if product is in cart on mount and when user changes
  useEffect(() => {
    if (user) {
      checkProductInCart();
    }
  }, [user, product.id]);

  const checkProductInCart = async () => {
    try {
      const cartItems = await getCart(user.uid);
      const cartItem = cartItems.find((item) => item.productId === product.id);
      setQuantity(cartItem ? cartItem.quantity : 0);
    } catch (error) {
      console.error("Error checking cart:", error);
      setQuantity(0);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      showNotification("Please login to add items to cart");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const result = await addToCart(user.uid, product, 1);
      if (result.success) {
        setQuantity(1);
        showNotification(`✓ ${product.name} added to cart!`);
        onCartUpdate?.();
      } else {
        showNotification(`Error: ${result.error}`);
      }
    } catch (error) {
      showNotification("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleIncreaseQuantity = async () => {
    const newQuantity = quantity + 1;
    setLoading(true);
    try {
      const result = await updateCartQuantity(
        user.uid,
        product.id,
        newQuantity,
      );
      if (result.success) {
        setQuantity(newQuantity);
        onCartUpdate?.();
      } else {
        showNotification(`Error: ${result.error}`);
      }
    } catch (error) {
      showNotification("Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  const handleDecreaseQuantity = async () => {
    const newQuantity = quantity - 1;
    setLoading(true);
    try {
      if (newQuantity === 0) {
        // Remove from cart if quantity becomes 0
        const result = await updateCartQuantity(user.uid, product.id, 0);
        if (result.success) {
          setQuantity(0);
          onCartUpdate?.();
        } else {
          showNotification(`Error: ${result.error}`);
        }
      } else {
        const result = await updateCartQuantity(
          user.uid,
          product.id,
          newQuantity,
        );
        if (result.success) {
          setQuantity(newQuantity);
          onCartUpdate?.();
        } else {
          showNotification(`Error: ${result.error}`);
        }
      }
    } catch (error) {
      showNotification("Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-showcase-card">
      <div
        className="product-image"
        onClick={handleProductClick}
        style={{ cursor: "pointer" }}
      >
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-details">
        <h3 onClick={handleProductClick} style={{ cursor: "pointer" }}>
          {product.name}
        </h3>
        <p className="product-category">{product.category}</p>
        <p className="product-description">{product.description}</p>
        <p className="product-price">
          ₹{product.price.toLocaleString("en-IN")}
        </p>

        {quantity === 0 ? (
          <button
            className="add-btn"
            onClick={handleAddToCart}
            disabled={loading}
          >
            {user ? (loading ? "Adding..." : "Add to Cart") : "Login to Buy"}
          </button>
        ) : (
          <div className="quantity-controls">
            <button
              className="qty-btn minus"
              onClick={handleDecreaseQuantity}
              disabled={loading}
              title="Remove from cart"
            >
              <FaMinus />
            </button>
            <span className="qty-display">{quantity}</span>
            <button
              className="qty-btn plus"
              onClick={handleIncreaseQuantity}
              disabled={loading}
              title="Add more"
            >
              <FaPlus />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
