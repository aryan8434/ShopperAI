import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaMinus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import {
  addToCart,
  getCart,
  updateCartQuantity,
} from "../services/CartService";
import productsData from "../data/productsData";
import Loading from "../components/Loading";
import "../css/ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Find product by ID from all categories
    let foundProduct = null;
    Object.values(productsData).forEach((categoryProducts) => {
      if (Array.isArray(categoryProducts)) {
        const prod = categoryProducts.find((p) => p.id === parseInt(id));
        if (prod) foundProduct = prod;
      }
    });

    if (foundProduct) {
      setProduct(foundProduct);
      if (user) {
        checkProductInCart();
      }
    } else {
      navigate("/products");
    }
  }, [id, user, navigate]);

  const checkProductInCart = async () => {
    try {
      const cartItems = await getCart(user.uid);
      const cartItem = cartItems.find(
        (item) => item.productId === parseInt(id),
      );
      setQuantity(cartItem ? cartItem.quantity : 0);
    } catch (error) {
      console.error("Error checking cart:", error);
      setQuantity(0);
    }
  };

  const showNotification = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
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
        showNotification(`✓ Quantity updated!`);
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
          showNotification("✓ Removed from cart!");
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
          showNotification(`✓ Quantity updated!`);
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

  if (!product) {
    return (
      <div className="product-detail-container">
        <Loading message="Loading product..." size="large" />
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      {message && <div className="notification">{message}</div>}

      <div className="back-button">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="product-detail-content">
        <div className="product-image-section">
          <img
            src={product.image}
            alt={product.name}
            className="product-detail-image"
          />
        </div>

        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-category-detail">{product.category}</p>

          <div className="product-price-section">
            <span className="product-price-detail">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="product-description-section">
            <h3>Description</h3>
            <p className="product-description-detail">
              {product.description ||
                `Discover the ${product.name} - a premium ${product.category.toLowerCase()} item designed for quality and comfort. This product offers excellent value and is perfect for your needs.`}
            </p>
          </div>

          <div className="product-actions">
            {quantity === 0 ? (
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={loading}
              >
                {user
                  ? loading
                    ? "Adding..."
                    : "Add to Cart"
                  : "Login to Buy"}
              </button>
            ) : (
              <div className="quantity-controls-detail">
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
      </div>
    </div>
  );
};

export default ProductDetail;
