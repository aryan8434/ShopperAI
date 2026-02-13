import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "../services/CartService";
import Loading from "../components/Loading";
import "../css/Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadCart();
  }, [user, navigate]);

  const loadCart = async () => {
    setLoading(true);
    const items = await getCart(user.uid);
    setCartItems(items);
    setLoading(false);
  };

  const handleRemoveItem = async (productId) => {
    const result = await removeFromCart(user.uid, productId);
    if (result.success) {
      setCartItems(cartItems.filter((item) => item.productId !== productId));
      setMessage("Item removed from cart");
      setTimeout(() => setMessage(""), 2000);
    } else {
      setMessage(`Error: ${result.error}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const result = await updateCartQuantity(user.uid, productId, newQuantity);
    if (result.success) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item,
        ),
      );
    } else {
      setMessage(`Error: ${result.error}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  if (loading) {
    return <Loading message="Loading your cart..." size="large" />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        {message && <div className="notification">{message}</div>}
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Start shopping to add items to your cart</p>
          <button
            className="continue-shopping-btn"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      {message && <div className="notification">{message}</div>}

      <div className="cart-content">
        <h1>Shopping Cart</h1>

        <div className="cart-items-section">
          <h2>Items ({cartItems.length})</h2>
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.productId} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-category">{item.category}</p>
                  <p className="item-price">
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>
                  <p className="item-id">Product ID: {item.productId}</p>
                </div>

                <div className="item-quantity">
                  <button
                    className="qty-btn"
                    onClick={() =>
                      handleUpdateQuantity(item.productId, item.quantity - 1)
                    }
                  >
                    <FaMinus />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() =>
                      handleUpdateQuantity(item.productId, item.quantity + 1)
                    }
                  >
                    <FaPlus />
                  </button>
                </div>

                <div className="item-total">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </div>

                <button
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.productId)}
                  title="Remove item"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{calculateTotal().toLocaleString("en-IN")}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span className="free">FREE</span>
          </div>
          <div className="summary-row">
            <span>Tax:</span>
            <span>
              ₹{Math.round(calculateTotal() * 0.18).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>
              ₹
              {(
                calculateTotal() + Math.round(calculateTotal() * 0.18)
              ).toLocaleString("en-IN")}
            </span>
          </div>

          <button
            className="checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>

          <button
            className="continue-shopping-btn"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
