import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCreditCard, FaLock, FaWallet, FaHistory } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getCart, clearCart } from "../services/CartService";
import { createOrder } from "../services/ShoppingService";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../css/Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [selectedCard, setSelectedCard] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const [savedUPIs, setSavedUPIs] = useState([]);
  const [selectedUPI, setSelectedUPI] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadCart();
    loadSavedCards();
  }, [user, navigate]);

  // Load saved cards from user data
  const loadSavedCards = () => {
    if (userData?.paymentMethods?.cards) {
      setSavedCards(userData.paymentMethods.cards);
      if (userData.paymentMethods.cards.length > 0) {
        setSelectedCard(userData.paymentMethods.cards[0]);
      }
    }
  };

  // Load saved UPIs from user data
  const loadSavedUPIs = () => {
    if (userData?.paymentMethods?.upiAddresses) {
      setSavedUPIs(userData.paymentMethods.upiAddresses);
      if (userData.paymentMethods.upiAddresses.length > 0) {
        setSelectedUPI(userData.paymentMethods.upiAddresses[0].upiAddress);
      }
    }
  };

  // Update saved cards when userData changes
  useEffect(() => {
    loadSavedCards();
    loadSavedUPIs();
  }, [userData]);

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

  const [upiId, setUpiId] = useState("");

  const handlePlaceOrder = async () => {
    // Validate Credit Card
    if (paymentMethod === "credit_card") {
      // Only validate card details if using a new card (selectedCard is null)
      if (selectedCard === null) {
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
      // If selectedCard is not null, we have a saved card, so no validation needed
    }

    // Validate UPI
    if (paymentMethod === "upi") {
      if (!upiId && !selectedUPI) {
        setMessage("Please enter or select a UPI ID");
        return;
      }
      const finalUpiId = selectedUPI || upiId;
      if (!finalUpiId.includes("@")) {
        setMessage("Please enter a valid UPI ID");
        return;
      }
    }

    setLoading(true);
    setMessage("Processing payment...");

    try {
      const { total } = calculateTotal();

      if (paymentMethod === "wallet") {
        // Check wallet balance
        const currentWalletBalance = userData?.paymentMethods?.wallet || 0;
        if (currentWalletBalance < total) {
          setMessage("Insufficient wallet balance!");
          setLoading(false);
          return;
        }

        // Deduct from wallet
        const newBalance = currentWalletBalance - total;
        const transaction = {
          id: Date.now(),
          type: "debit",
          amount: total,
          description: `Order payment - ${cartItems.length} items`,
          timestamp: new Date(),
          orderId: `ORD-${Date.now()}`,
        };

        await updateDoc(doc(db, "users", user.uid), {
          "paymentMethods.wallet": newBalance,
          "walletTransactions": [
            transaction,
            ...(userData?.walletTransactions || []),
          ],
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
      const totals = calculateTotal();
      const orderData = {
        items: cartItems,
        totalPrice: totals.total,
        shippingAddress: userData?.profile || {},
        paymentMethod: {
          type: paymentMethod,
          details:
            paymentMethod === "upi"
              ? { upiId: selectedUPI || upiId }
              : paymentMethod === "credit_card"
                ? {
                    cardLast4: selectedCard
                      ? selectedCard.cardNumber.slice(-4)
                      : cardDetails.cardNumber.slice(-4),
                  }
                : {},
        },
        paymentStatus: "completed",
      };
      const result = await createOrder(user.uid, orderData);

      if (result.id) {
        // Clear the cart after successful order
        await clearCart(user.uid);

        setTimeout(() => {
          navigate(`/order-success/${result.id}`, {
            state: { order: result },
          });
        }, 1500);
      } else {
        setMessage("Error: Failed to create order");
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
                <span>
                  Digital Wallet
                  {paymentMethod === "wallet" && (
                    <div
                      className="wallet-details"
                      style={{
                        backgroundColor: "#673ab7",
                        color: "white",
                        padding: "15px",
                        borderRadius: "8px",
                        marginTop: "10px",
                      }}
                    >
                      <p style={{color: "white", margin: 0, fontSize: "1.1rem" }}>
                        Available Balance: ₹
                        {(userData?.paymentMethods?.wallet || 0).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                      <p
                        className="small-text"
                        style={{ color: "#e0e0e0", marginTop: "5px" }}
                      >
                        Proceeding will deduct from your wallet
                      </p>
                    </div>
                  )}
                </span>
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
                {savedCards.length > 0 && (
                  <div className="saved-cards">
                    <h3>Select a saved card:</h3>
                    {savedCards.map((card, index) => (
                      <label key={index} className="card-option">
                        <input
                          type="radio"
                          name="savedCard"
                          checked={selectedCard === card}
                          onChange={() => setSelectedCard(card)}
                        />
                        <div className="card-radio-indicator"></div>
                        <span>
                          **** **** **** {card.cardNumber.slice(-4)}
                          <small>({card.cardHolder})</small>
                        </span>
                      </label>
                    ))}
                    <label className="card-option">
                      <input
                        type="radio"
                        name="savedCard"
                        checked={selectedCard === null}
                        onChange={() => setSelectedCard(null)}
                      />
                      <div className="card-radio-indicator"></div>
                      <span>Use new card</span>
                    </label>
                  </div>
                )}

                {selectedCard === null && (
                  <>
                    <h3>Enter card details:</h3>
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
                          type="text"
                          name="cvv"
                          value={cardDetails.cvv}
                          onChange={handleCardInputChange}
                          placeholder="123"
                          maxLength="3"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {paymentMethod === "upi" && (
              <div className="upi-details">
                {savedUPIs.length > 0 && (
                  <div className="saved-upis">
                    <h3>Select a saved UPI ID:</h3>
                    {savedUPIs.map((upi, index) => (
                      <label key={index} className="upi-option">
                        <input
                          type="radio"
                          name="savedUPI"
                          checked={selectedUPI === upi.upiAddress}
                          onChange={() => setSelectedUPI(upi.upiAddress)}
                        />
                        <div className="upi-radio-indicator"></div>
                        <span>
                          {upi.upiAddress}
                        </span>
                      </label>
                    ))}
                    <label className="upi-option">
                      <input
                        type="radio"
                        name="savedUPI"
                        checked={selectedUPI === null}
                        onChange={() => setSelectedUPI(null)}
                      />
                      <div className="upi-radio-indicator"></div>
                      <span>Use new UPI ID</span>
                    </label>
                  </div>
                )}

                {selectedUPI === null && (
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@bank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                )}
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
