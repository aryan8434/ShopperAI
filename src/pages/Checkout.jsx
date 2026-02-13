import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCreditCard, FaLock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getCart } from "../services/CartService";
import { createOrder } from "../services/OrderService";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../css/Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "4532 1234 5678 9010",
    cardHolder: user?.displayName || "John Doe",
    expiryMonth: "12",
    expiryYear: "2025",
    cvv: "123",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadCart();
  }, [user, navigate]);

  const loadCart = async () => {
    const items = await getCart(user.uid);
    if (items.length === 0) {
      navigate("/cart");
      return;
    }
    setCartItems(items);
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const tax = Math.round(subtotal * 0.18);
    return { subtotal, tax, total: subtotal + tax };
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const simulatePayment = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate, 10% failure rate
        const success = Math.random() > 0.1;
        resolve(success);
      }, 2000);
    });
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === "credit_card") {
      if (
        !cardDetails.cardNumber ||
        !cardDetails.cardHolder ||
        !cardDetails.expiryMonth ||
        !cardDetails.expiryYear ||
        !cardDetails.cvv
      ) {
        setMessage("Please fill in all card details");
        return;
      }
    }

    setLoading(true);
    setMessage("Processing payment...");

    try {
      const { total } = calculateTotal();

      if (paymentMethod === "wallet") {
        // Check wallet balance
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const walletBalance = userDoc.data()?.paymentMethods?.wallet || 0;

        if (walletBalance < total) {
          setMessage("Insufficient wallet balance!");
          setLoading(false);
          return;
        }

        // Deduct from wallet
        const newBalance = walletBalance - total;
        await updateDoc(doc(db, "users", user.uid), {
          "paymentMethods.wallet": newBalance,
        });

        setMessage("Payment successful! Order placed.");
      } else {
        // Simulate payment processing for card/UPI
        const paymentSuccess = await simulatePayment();

        if (!paymentSuccess) {
          setMessage("Payment failed! Please try again.");
          setLoading(false);
          return;
        }

        setMessage("Payment successful! Order placed.");
      }

      // Create order in database
      const result = await createOrder(user.uid, cartItems);

      if (result.success) {
        setTimeout(() => {
          navigate(`/order-success/${result.orderId}`, {
            state: { order: result.order },
          });
        }, 1500);
      } else {
        setMessage(`Error: ${result.error}`);
        setLoading(false);
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const totals = calculateTotal();

  return (
    <div className="checkout-container">
      {message && <div className="notification">{message}</div>}

      <div className="checkout-content">
        <h1>Checkout</h1>

        <div className="checkout-grid">
          {/* Left Section - Order Summary */}
          <div className="order-summary-section">
            <h2>Order Summary</h2>

            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.productId} className="order-item">
                  <div className="order-item-info">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="order-item-price">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{totals.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="total-row">
                <span>Tax (18%):</span>
                <span>₹{totals.tax.toLocaleString("en-IN")}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span className="free">FREE</span>
              </div>
              <div className="total-row final-total">
                <span>Total Amount:</span>
                <span>₹{totals.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Right Section - Payment */}
          <div className="payment-section">
            <h2>Payment Method</h2>

            <div className="payment-method-group">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="wallet"
                  checked={paymentMethod === "wallet"}
                  onChange={handlePaymentChange}
                />
                <span>Digital Wallet</span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="credit_card"
                  checked={paymentMethod === "credit_card"}
                  onChange={handlePaymentChange}
                />
                <span>Credit/Debit Card</span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={handlePaymentChange}
                />
                <span>UPI</span>
              </label>
            </div>

            {paymentMethod === "credit_card" && (
              <div className="card-details">
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleCardInputChange}
                    placeholder="4532 1234 5678 9010"
                    maxLength="19"
                  />
                </div>

                <div className="form-group">
                  <label>Card Holder Name</label>
                  <input
                    type="text"
                    name="cardHolder"
                    value={cardDetails.cardHolder}
                    onChange={handleCardInputChange}
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Month</label>
                    <input
                      type="text"
                      name="expiryMonth"
                      value={cardDetails.expiryMonth}
                      onChange={handleCardInputChange}
                      placeholder="MM"
                      maxLength="2"
                    />
                  </div>

                  <div className="form-group">
                    <label>Expiry Year</label>
                    <input
                      type="text"
                      name="expiryYear"
                      value={cardDetails.expiryYear}
                      onChange={handleCardInputChange}
                      placeholder="YYYY"
                      maxLength="4"
                    />
                  </div>

                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleCardInputChange}
                      placeholder="123"
                      maxLength="3"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "upi" && (
              <div className="upi-details">
                <div className="form-group">
                  <label>UPI ID</label>
                  <input type="text" placeholder="yourname@bank" disabled />
                </div>
              </div>
            )}

            {paymentMethod === "wallet" && (
              <div className="wallet-details">
                <p>Available Balance: ₹5,000</p>
                <p className="small-text">
                  Proceeding will deduct from your wallet
                </p>
              </div>
            )}

            <div className="security-info">
              <FaLock /> Secure Payment Gateway
            </div>

            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>

            <button
              className="back-btn"
              onClick={() => navigate("/cart")}
              disabled={loading}
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
