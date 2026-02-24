import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCreditCard, FaLock, FaWallet, FaHistory, FaMapMarkerAlt,
  FaChevronRight, FaArrowLeft, FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getCart, clearCart } from "../services/CartService";
import { createOrder } from "../services/ShoppingService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../css/Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();

  // ── Step: 1 = Address, 2 = Payment ──
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Address
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [selectedCard, setSelectedCard] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [savedUPIs, setSavedUPIs] = useState([]);
  const [selectedUPI, setSelectedUPI] = useState(null);
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "", cardHolder: "", expiryMonth: "", expiryYear: "", cvv: "",
  });

  // ── Data loading ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadCart();
  }, [user, navigate]);

  useEffect(() => {
    if (!userData) return;
    // Addresses
    const addresses = userData.addresses || [];
    if (addresses.length === 0 && userData.profile?.address) {
      const legacy = { id: 0, isDefault: true, label: "Home", ...userData.profile };
      setSavedAddresses([legacy]);
      setSelectedAddressId(0);
    } else {
      setSavedAddresses(addresses);
      const def = addresses.find(a => a.isDefault) || addresses[0];
      if (def) setSelectedAddressId(def.id);
    }
    // Cards
    const cards = userData.paymentMethods?.cards || [];
    setSavedCards(cards);
    if (cards.length > 0) setSelectedCard(cards[0]);
    // UPIs
    const upis = userData.paymentMethods?.upiAddresses || [];
    setSavedUPIs(upis);
    if (upis.length > 0) setSelectedUPI(upis[0].upiAddress);
  }, [userData]);

  const loadCart = async () => {
    const items = await getCart(user.uid);
    if (items.length === 0) { navigate("/cart"); return; }
    setCartItems(items);
  };

  // ── Calculations ──────────────────────────────────────────────────
  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { subtotal, total: subtotal };
  };

  // ── Step 1 → 2 ───────────────────────────────────────────────────
  const handleContinueToPayment = () => {
    if (savedAddresses.length > 0 && !selectedAddressId) {
      setMessage("Please select a delivery address.");
      return;
    }
    setMessage("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Place order ───────────────────────────────────────────────────
  const simulatePayment = () =>
    new Promise(resolve => setTimeout(() => resolve(Math.random() > 0.1), 2000));

  const handlePlaceOrder = async () => {
    if (paymentMethod === "credit_card" && selectedCard === null) {
      if (!cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv) {
        setMessage("Please fill in all card details.");
        return;
      }
    }
    if (paymentMethod === "upi") {
      const finalUpi = selectedUPI || upiId;
      if (!finalUpi) { setMessage("Please enter or select a UPI ID."); return; }
      if (!finalUpi.includes("@")) { setMessage("Please enter a valid UPI ID."); return; }
    }

    setLoading(true);
    setMessage("Processing payment...");

    try {
      const { total } = calculateTotal();

      if (paymentMethod === "wallet") {
        const balance = userData?.paymentMethods?.wallet || 0;
        if (balance < total) { setMessage("Insufficient wallet balance!"); setLoading(false); return; }
        const transaction = {
          id: Date.now(), type: "debit", amount: total,
          description: `Order payment – ${cartItems.length} items`,
          timestamp: new Date(), orderId: `ORD-${Date.now()}`,
        };
        await updateDoc(doc(db, "users", user.uid), {
          "paymentMethods.wallet": balance - total,
          walletTransactions: [transaction, ...(userData?.walletTransactions || [])],
        });
      } else {
        const ok = await simulatePayment();
        if (!ok) { setMessage("Payment failed! Please try again."); setLoading(false); return; }
      }

      const totals = calculateTotal();
      const orderData = {
        items: cartItems,
        totalPrice: totals.total,
        shippingAddress: savedAddresses.find(a => a.id === selectedAddressId) || userData?.profile || {},
        paymentMethod: {
          type: paymentMethod,
          details:
            paymentMethod === "upi"   ? { upiId: selectedUPI || upiId } :
            paymentMethod === "credit_card" ? { cardLast4: selectedCard ? selectedCard.cardNumber.slice(-4) : cardDetails.cardNumber.slice(-4) } :
            {},
        },
        paymentStatus: "completed",
      };

      const result = await createOrder(user.uid, orderData);
      if (result.id) {
        await clearCart(user.uid);
        setTimeout(() => navigate(`/order-success/${result.id}`, { state: { order: result } }), 1200);
      } else {
        setMessage("Error: Failed to create order.");
        setLoading(false);
      }
    } catch {
      setMessage("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const totals = calculateTotal();
  const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="co-container">

      {/* ── Top bar ── */}
      <div className="co-topbar">
        <button
          className="co-back-link"
          onClick={() => step === 1 ? navigate("/cart") : setStep(1)}
        >
          <FaArrowLeft />
          {step === 1 ? "Cart" : "Delivery"}
        </button>

        <div className="co-stepper">
          <div className={`co-step ${step >= 1 ? "co-step-done" : ""}`}>
            <span className="co-step-num">1</span>
            <span className="co-step-lbl">Delivery</span>
          </div>
          <div className={`co-step-line ${step >= 2 ? "co-step-line-done" : ""}`} />
          <div className={`co-step ${step >= 2 ? "co-step-done" : ""}`}>
            <span className="co-step-num">2</span>
            <span className="co-step-lbl">Payment</span>
          </div>
        </div>

        {step === 1 ? (
          <button className="co-continue-btn" onClick={handleContinueToPayment}>
            Continue to Payment <FaChevronRight />
          </button>
        ) : (
          <button className="co-place-btn" onClick={handlePlaceOrder} disabled={loading}>
            {loading ? "Processing…" : "Place Order"}
          </button>
        )}
      </div>

      {message && <div className="co-message">{message}</div>}

      <div className="co-body">

        {/* ══════════════ STEP 1 ══════════════ */}
        {step === 1 && (
          <div className="co-grid">
            {/* Addresses */}
            <div className="co-card">
              <h2 className="co-card-title"><FaMapMarkerAlt className="co-title-icon" /> Delivery Address</h2>
              {savedAddresses.length === 0 ? (
                <div className="co-no-address">
                  No saved addresses.{" "}
                  <span className="co-link" onClick={() => navigate("/profile")}>Add one in Profile →</span>
                </div>
              ) : (
                <div className="co-addr-list">
                  {savedAddresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`co-addr-card ${selectedAddressId === addr.id ? "co-addr-selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="deliveryAddress"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                      />
                      <div className="co-addr-details">
                        <div className="co-addr-label-row">
                          <span className="co-addr-badge">{addr.label || "Home"}</span>
                          {addr.isDefault && <span className="co-default-badge">Default</span>}
                        </div>
                        <div className="co-addr-text">{addr.address}</div>
                        <div className="co-addr-text">{addr.city}, {addr.state} – {addr.zipCode}</div>
                        {addr.phone && <div className="co-addr-phone">📞 {addr.phone}</div>}
                      </div>
                    </label>
                  ))}
                  <button className="co-add-addr-btn" onClick={() => navigate("/profile")}>
                    + Add New Address
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="co-card">
              <h2 className="co-card-title">Order Summary</h2>
              <div className="co-item-list">
                {cartItems.map(item => (
                  <div key={item.productId} className="co-item-row">
                    <div className="co-item-info">
                      <span className="co-item-name">{item.name}</span>
                      <span className="co-item-qty">Qty: {item.quantity}</span>
                    </div>
                    <span className="co-item-price">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="co-totals">
                <div className="co-total-row"><span>Subtotal</span><span>₹{totals.subtotal.toLocaleString("en-IN")}</span></div>
                <div className="co-total-row"><span>Shipping</span><span className="co-free">FREE</span></div>
                <div className="co-total-row co-total-final"><span>Total Amount</span><span>₹{totals.total.toLocaleString("en-IN")}</span></div>
              </div>
              {/* Mobile CTA */}
              <button className="co-continue-mobile" onClick={handleContinueToPayment}>
                Continue to Payment <FaChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════ STEP 2 ══════════════ */}
        {step === 2 && (
          <div className="co-grid">
            {/* Payment Methods */}
            <div className="co-card">
              <h2 className="co-card-title"><FaCreditCard className="co-title-icon" /> Payment Method</h2>

              <div className="co-pay-methods">
                {/* Wallet */}
                <label className={`co-pay-option ${paymentMethod === "wallet" ? "co-pay-selected" : ""}`}>
                  <input type="radio" name="payment" value="wallet" checked={paymentMethod === "wallet"} onChange={e => setPaymentMethod(e.target.value)} />
                  <div className="co-pay-icon"><FaWallet /></div>
                  <div className="co-pay-info">
                    <div className="co-pay-name">Digital Wallet</div>
                    <div className="co-pay-sub">Balance: ₹{(userData?.paymentMethods?.wallet || 0).toLocaleString("en-IN")}</div>
                  </div>
                </label>

                {/* Credit / Debit Card */}
                <label className={`co-pay-option ${paymentMethod === "credit_card" ? "co-pay-selected" : ""}`}>
                  <input type="radio" name="payment" value="credit_card" checked={paymentMethod === "credit_card"} onChange={e => setPaymentMethod(e.target.value)} />
                  <div className="co-pay-icon"><FaCreditCard /></div>
                  <div className="co-pay-info">
                    <div className="co-pay-name">Credit / Debit Card</div>
                    <div className="co-pay-sub">{savedCards.length > 0 ? `${savedCards.length} card(s) saved` : "Enter new card"}</div>
                  </div>
                </label>

                {/* UPI */}
                <label className={`co-pay-option ${paymentMethod === "upi" ? "co-pay-selected" : ""}`}>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={e => setPaymentMethod(e.target.value)} />
                  <div className="co-pay-icon"><FaWallet /></div>
                  <div className="co-pay-info">
                    <div className="co-pay-name">UPI</div>
                    <div className="co-pay-sub">{savedUPIs.length > 0 ? `${savedUPIs.length} UPI ID(s) saved` : "Enter UPI ID"}</div>
                  </div>
                </label>
              </div>

              {/* Card Details */}
              {paymentMethod === "credit_card" && (
                <div className="co-pay-detail-box">
                  {savedCards.length > 0 && (
                    <>
                      <h4>Saved Cards</h4>
                      {savedCards.map((card, i) => (
                        <label key={i} className={`co-saved-option ${selectedCard === card ? "co-saved-selected" : ""}`}>
                          <input type="radio" name="savedCard" checked={selectedCard === card} onChange={() => setSelectedCard(card)} />
                          <FaCreditCard className="co-saved-icon" />
                          <span>•••• {card.cardNumber.slice(-4)} <small>({card.cardHolder})</small></span>
                        </label>
                      ))}
                      <label className={`co-saved-option ${selectedCard === null ? "co-saved-selected" : ""}`}>
                        <input type="radio" name="savedCard" checked={selectedCard === null} onChange={() => setSelectedCard(null)} />
                        <span>+ Use new card</span>
                      </label>
                    </>
                  )}
                  {selectedCard === null && (
                    <div className="co-new-card-form">
                      <h4>Enter Card Details</h4>
                      <div className="co-form-group">
                        <label>Card Number</label>
                        <input type="text" name="cardNumber" value={cardDetails.cardNumber} onChange={e => setCardDetails(p => ({ ...p, cardNumber: e.target.value }))} placeholder="4532 1234 5678 9010" maxLength="19" />
                      </div>
                      <div className="co-form-group">
                        <label>Card Holder Name</label>
                        <input type="text" name="cardHolder" value={cardDetails.cardHolder} onChange={e => setCardDetails(p => ({ ...p, cardHolder: e.target.value }))} placeholder="John Doe" />
                      </div>
                      <div className="co-form-row">
                        <div className="co-form-group">
                          <label>Expiry Month</label>
                          <input type="text" name="expiryMonth" value={cardDetails.expiryMonth} onChange={e => setCardDetails(p => ({ ...p, expiryMonth: e.target.value }))} placeholder="MM" maxLength="2" />
                        </div>
                        <div className="co-form-group">
                          <label>Expiry Year</label>
                          <input type="text" name="expiryYear" value={cardDetails.expiryYear} onChange={e => setCardDetails(p => ({ ...p, expiryYear: e.target.value }))} placeholder="YYYY" maxLength="4" />
                        </div>
                        <div className="co-form-group">
                          <label>CVV</label>
                          <input type="password" name="cvv" value={cardDetails.cvv} onChange={e => setCardDetails(p => ({ ...p, cvv: e.target.value }))} placeholder="•••" maxLength="3" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* UPI Details */}
              {paymentMethod === "upi" && (
                <div className="co-pay-detail-box">
                  {savedUPIs.length > 0 && (
                    <>
                      <h4>Saved UPI IDs</h4>
                      {savedUPIs.map((upi, i) => (
                        <label key={i} className={`co-saved-option ${selectedUPI === upi.upiAddress ? "co-saved-selected" : ""}`}>
                          <input type="radio" name="savedUPI" checked={selectedUPI === upi.upiAddress} onChange={() => setSelectedUPI(upi.upiAddress)} />
                          <span>{upi.upiAddress}</span>
                        </label>
                      ))}
                      <label className={`co-saved-option ${selectedUPI === null ? "co-saved-selected" : ""}`}>
                        <input type="radio" name="savedUPI" checked={selectedUPI === null} onChange={() => setSelectedUPI(null)} />
                        <span>+ Enter new UPI ID</span>
                      </label>
                    </>
                  )}
                  {selectedUPI === null && (
                    <div className="co-form-group" style={{ marginTop: 12 }}>
                      <label>UPI ID</label>
                      <input type="text" placeholder="yourname@bank" value={upiId} onChange={e => setUpiId(e.target.value)} />
                    </div>
                  )}
                </div>
              )}

              {/* Wallet detail */}
              {paymentMethod === "wallet" && (
                <div className="co-wallet-box">
                  <div className="co-wallet-amount">₹{(userData?.paymentMethods?.wallet || 0).toLocaleString("en-IN")}</div>
                  <div className="co-wallet-label">Available Wallet Balance</div>
                  <button className="co-wallet-history-btn" onClick={() => navigate("/wallet-history")}>
                    <FaHistory /> View History
                  </button>
                </div>
              )}

              <div className="co-security-badge">
                <FaShieldAlt /> 256-bit SSL Encrypted Payment
              </div>

              {/* Mobile Place Order */}
              <button className="co-place-mobile" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? "Processing…" : `Place Order · ₹${totals.total.toLocaleString("en-IN")}`}
              </button>
            </div>

            {/* Order Summary (step 2 right panel) */}
            <div className="co-card">
              <h2 className="co-card-title">Order Summary</h2>

              {/* Selected address summary */}
              {selectedAddr && (
                <div className="co-addr-summary">
                  <FaMapMarkerAlt className="co-addr-summary-icon" />
                  <div>
                    <div className="co-addr-summary-label">{selectedAddr.label || "Home"}</div>
                    <div className="co-addr-summary-text">{selectedAddr.address}, {selectedAddr.city}</div>
                  </div>
                  <button className="co-addr-change-btn" onClick={() => setStep(1)}>Change</button>
                </div>
              )}

              <div className="co-item-list">
                {cartItems.map(item => (
                  <div key={item.productId} className="co-item-row">
                    <div className="co-item-info">
                      <span className="co-item-name">{item.name}</span>
                      <span className="co-item-qty">Qty: {item.quantity}</span>
                    </div>
                    <span className="co-item-price">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="co-totals">
                <div className="co-total-row"><span>Subtotal</span><span>₹{totals.subtotal.toLocaleString("en-IN")}</span></div>
                <div className="co-total-row"><span>Shipping</span><span className="co-free">FREE</span></div>
                <div className="co-total-row co-total-final"><span>Total Amount</span><span>₹{totals.total.toLocaleString("en-IN")}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
