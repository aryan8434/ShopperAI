import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft, FaBox, FaClock, FaCheck, FaTimes,
  FaRedo, FaMapMarkerAlt, FaCreditCard, FaWallet,
  FaShippingFast, FaClipboardCheck,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getOrderById, retryOrderPayment, cancelOrder } from "../services/ShoppingService";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import AlertDialog from "../components/AlertDialog";
import Loading from "../components/Loading";
import useAlert from "../hooks/useAlert";
import "../css/OrderDetail.css";

// ─── Timeline logic ──────────────────────────────────────────────
// Day 0 → placed, Day 1 → confirmed, Day 2 → shipped, Day 4 → delivered
const TIMELINE_STEPS = [
  { key: "placed",     label: "Order Placed",   icon: <FaClipboardCheck />, days: 0 },
  { key: "confirmed",  label: "Confirmed",       icon: <FaCheck />,          days: 1 },
  { key: "shipped",    label: "Shipped",         icon: <FaShippingFast />,   days: 2 },
  { key: "delivered",  label: "Delivered",       icon: <FaBox />,            days: 4 },
];

const computeTrackingStep = (createdAt, cancelled) => {
  if (cancelled) return -1; // no step active for cancelled
  if (!createdAt) return 0;
  const placed = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const now = new Date();
  const hoursElapsed = (now - placed) / (1000 * 60 * 60);
  const daysElapsed = hoursElapsed / 24;

  if (daysElapsed >= 4) return 3;      // delivered
  if (daysElapsed >= 2) return 2;      // shipped
  if (daysElapsed >= 1) return 1;      // confirmed
  return 0;                            // placed
};

// Map step index → firestore status value
const STEP_TO_STATUS = ["processing", "processing", "shipped", "delivered"];

const stepDate = (createdAt, days) => {
  if (!createdAt) return "";
  const base = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const d = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

// ─── Return timeline ──────────────────────────────────────────────
const RETURN_STEPS = [
  { key: "requested",  label: "Return Requested",  icon: <FaRedo />,         days: 0 },
  { key: "pickedup",   label: "Picked Up",          icon: <FaShippingFast />, days: 1 },
  { key: "processed",  label: "Refund Processed",   icon: <FaClipboardCheck />, days: 1 },
  { key: "credited",   label: "Amount Credited",    icon: <FaCheck />,        days: 2 },
];

const computeReturnStep = (returnRequestedAt) => {
  if (!returnRequestedAt) return 0;
  const base = returnRequestedAt.toDate ? returnRequestedAt.toDate() : new Date(returnRequestedAt);
  const daysElapsed = (Date.now() - base.getTime()) / (1000 * 60 * 60 * 24);
  if (daysElapsed >= 2) return 3;
  if (daysElapsed >= 1) return 2;
  return 1;  // picked up starts after request
};

const ReturnTimeline = ({ requestedAt }) => (
  <div className="od-timeline">
    {RETURN_STEPS.map((step, idx) => {
      const currentStep = computeReturnStep(requestedAt);
      const done   = idx < currentStep;
      const active = idx === currentStep;
      const pending = idx > currentStep;
      return (
        <React.Fragment key={step.key}>
          <div className={`tl-step ${done ? "tl-done" : active ? "tl-active" : "tl-pending"}`}>
            <div className="tl-circle">{done ? <FaCheck /> : step.icon}</div>
            <div className="tl-label">{step.label}</div>
            <div className="tl-date">{!pending ? stepDate(requestedAt, step.days) : ""}</div>
          </div>
          {idx < RETURN_STEPS.length - 1 && (
            <div className={`tl-line ${idx < currentStep ? "tl-line-done" : ""}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Unified OrderTimeline (two rows when return exists) ──────────
const OrderTimeline = ({ currentStep, createdAt, cancelled, returnInfo }) => {
  if (cancelled) return null;

  const returnStep = returnInfo ? computeReturnStep(returnInfo.requestedAt) : -1;

  const renderRow = (steps, activeIdx, isReturn) => (
    <div className="od-timeline">
      {steps.map((step, idx) => {
        const done    = idx < activeIdx;
        const active  = idx === activeIdx;
        const pending = idx > activeIdx;
        const dateBase = isReturn ? returnInfo?.requestedAt : createdAt;
        const dateDays = step.days;
        return (
          <React.Fragment key={step.key}>
            <div className={`tl-step ${done ? "tl-done" : active ? "tl-active" : "tl-pending"}`}>
              <div className={`tl-circle ${isReturn && !pending ? "tl-return" : ""}`}>
                {done ? <FaCheck /> : step.icon}
              </div>
              <div className="tl-label">{step.label}</div>
              <div className="tl-date">
                {!pending && dateBase ? stepDate(dateBase, dateDays) : ""}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className={`tl-line ${done ? (isReturn ? "tl-line-return" : "tl-line-done") : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className="od-timeline-wrapper">
      {/* Row 1 – Order steps */}
      {renderRow(TIMELINE_STEPS, currentStep, false)}

      {/* Row 2 – Return steps (only if return requested) */}
      {returnInfo && (
        <>
          <div className="od-timeline-divider">
            <span className="od-timeline-divider-icon">↩</span>
            <span className="od-timeline-divider-label">Return initiated</span>
          </div>
          {renderRow(RETURN_STEPS, returnStep, true)}
        </>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────
const OrderDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user, refreshUserData } = useAuth();
  const { alertConfig, showAlert, hideAlert, confirm } = useAlert();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refundModal, setRefundModal] = useState({ isOpen: false });
  const [returnModal, setReturnModal] = useState({ isOpen: false });
  const [returnForm, setReturnForm] = useState({ reason: "", refundTo: "wallet" });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadOrder();
  }, [user, orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(user.uid, orderId);
      // Auto-update status based on time elapsed (only for non-cancelled)
      if (data && data.status !== "cancelled") {
        const step = computeTrackingStep(data.createdAt, false);
        const expectedStatus = STEP_TO_STATUS[step];
        if (data.status !== expectedStatus && data.status !== "delivered") {
          await updateDoc(doc(db, "users", user.uid, "orders", orderId), {
            status: expectedStatus,
            updatedAt: new Date(),
          });
          data.status = expectedStatus;
        }
      }
      setOrder(data);
    } catch (err) {
      console.error("Error loading order:", err);
      showAlert({ title: "Error", message: "Failed to load order.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateVal) => {
    try {
      if (!dateVal) return "N/A";
      const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return "N/A"; }
  };

  const getStatusMeta = (status, paymentStatus) => {
    if (paymentStatus === "failed") return { label: "Payment Failed", cls: "status-failed", icon: <FaTimes /> };
    if (status === "cancelled")     return { label: "Cancelled",       cls: "status-cancelled", icon: <FaTimes /> };
    if (status === "shipped")       return { label: "Shipped",         cls: "status-shipped",   icon: <FaShippingFast /> };
    if (status === "delivered")     return { label: "Delivered",       cls: "status-delivered", icon: <FaCheck /> };
    if (status === "completed")     return { label: "Completed",       cls: "status-completed", icon: <FaCheck /> };
    return { label: "Processing",   cls: "status-processing", icon: <FaClock /> };
  };

  const processWalletRefund = async (ord) => {
    try {
      const refundAmount = ord.totalPrice || 0;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentData = userSnap.data();
        const currentBalance = currentData.paymentMethods?.wallet || 0;
        const transaction = {
          id: Date.now(), type: "refund", amount: refundAmount,
          description: `Refund for Order ${ord.orderNumber || ord.id}`,
          timestamp: new Date(), orderId: ord.orderNumber || ord.id,
        };
        await updateDoc(userRef, {
          "paymentMethods.wallet": currentBalance + refundAmount,
          walletTransactions: [transaction, ...(currentData.walletTransactions || [])],
        });
        await refreshUserData();
      }
      return true;
    } catch { return false; }
  };

  const handleCancelOrder = async () => {
    const confirmed = await confirm({
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order? This action cannot be undone.",
      confirmText: "Yes, Cancel Order", cancelText: "Keep Order",
    });
    if (!confirmed) return;
    if (order.paymentMethod?.type === "wallet") {
      await performCancellation("wallet");
    } else {
      setRefundModal({ isOpen: true });
    }
  };

  const performCancellation = async (refundDest) => {
    try {
      setLoading(true);
      await cancelOrder(user.uid, order.id);
      let message = "Your order has been cancelled successfully.";
      if (refundDest === "wallet") {
        const success = await processWalletRefund(order);
        if (success) message = `Order cancelled. ₹${(order.totalPrice || 0).toLocaleString("en-IN")} refunded to your wallet.`;
      } else {
        message = "Order cancelled. Refund to bank account in 5–7 days.";
      }
      setRefundModal({ isOpen: false });
      await loadOrder();
      showAlert({ title: "Order Cancelled", message, type: "success" });
    } catch {
      showAlert({ title: "Error", message: "Failed to cancel order.", type: "error" });
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    try {
      const result = await retryOrderPayment(user.uid, order.id);
      if (result.success) {
        showAlert({ title: "Success", message: `Payment successful! New wallet balance: ₹${result.newBalance}`, type: "success" });
        await refreshUserData();
        await loadOrder();
      } else {
        showAlert({ title: "Payment Failed", message: result.error, type: "error" });
      }
    } catch {
      showAlert({ title: "Error", message: "Failed to retry payment.", type: "error" });
    }
  };

  // ─── Return / Refund ─────────────────────────────────────────────
  const handleRequestReturn = () => {
    setReturnForm({ reason: "", refundTo: "wallet" });
    setReturnModal({ isOpen: true });
  };

  const performReturn = async () => {
    if (!returnForm.reason) { showAlert({ title: "Select a reason", message: "Please choose a return reason.", type: "error" }); return; }
    try {
      setLoading(true);
      const requestedAt = new Date();
      await updateDoc(doc(db, "users", user.uid, "orders", orderId), {
        status: "return_requested",
        returnInfo: { reason: returnForm.reason, refundTo: returnForm.refundTo, requestedAt },
      });
      // Auto-credit wallet on Day 2 if refundTo === wallet (simulated via Firestore; real: call after 2 days)
      if (returnForm.refundTo === "wallet") {
        // We store a scheduled credit; if user opens page after 2 days it auto-credits
        await updateDoc(doc(db, "users", user.uid, "orders", orderId), {
          "returnInfo.scheduledCredit": true,
        });
      }
      setReturnModal({ isOpen: false });
      await loadOrder();
      showAlert({ title: "Return Requested", message: `Return submitted! Refund will be to ${returnForm.refundTo === "wallet" ? "your Shopper Wallet (2 days)" : "original payment method (5–7 days)"}.`, type: "success" });
    } catch {
      showAlert({ title: "Error", message: "Failed to submit return request.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Auto-credit wallet for return if 2 days have passed ─────────
  useEffect(() => {
    if (!order?.returnInfo || !order?.returnInfo?.scheduledCredit) return;
    if (order.returnInfo.refundTo !== "wallet") return;
    const step = computeReturnStep(order.returnInfo.requestedAt);
    if (step >= 3) {
      // already credited?
      if (order.returnInfo.credited) return;
      (async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const d = snap.data();
            const bal = d.paymentMethods?.wallet || 0;
            const amt = order.totalPrice || 0;
            const tx = { id: Date.now(), type: "refund", amount: amt, description: `Return refund – ${order.orderNumber || order.id}`, timestamp: new Date(), orderId: order.id };
            await updateDoc(userRef, { "paymentMethods.wallet": bal + amt, walletTransactions: [tx, ...(d.walletTransactions || [])] });
            await updateDoc(doc(db, "users", user.uid, "orders", orderId), { "returnInfo.credited": true });
            await refreshUserData();
          }
        } catch { /* silent */ }
      })();
    }
  }, [order]);

  const getPaymentLabel = (type) => {
    if (type === "wallet") return "Digital Wallet";
    if (type === "credit_card") return "Credit / Debit Card";
    if (type === "upi") return "UPI";
    return type || "N/A";
  };

  const getPaymentIcon = (type) => (type === "wallet" || type === "upi") ? <FaWallet /> : <FaCreditCard />;

  if (loading) return <Loading message="Loading order details..." size="large" />;
  if (!order) return (
    <div className="od-not-found">
      <p>Order not found.</p>
      <button onClick={() => navigate("/orders")}>← Back to Orders</button>
    </div>
  );

  const { label: statusLabel, cls: statusCls, icon: statusIcon } = getStatusMeta(order.status, order.paymentStatus);
  const cancelled    = order.status === "cancelled";
  const trackingStep = computeTrackingStep(order.createdAt, cancelled);
  const canCancel    = order.status === "processing" || order.status === "confirmed" || (order.status === "shipped" && trackingStep < 3);

  return (
    <div className="od-container">
      {/* Top bar */}
      <div className="od-topbar">
        <button className="od-back-btn" onClick={() => navigate("/orders")}>
          <FaArrowLeft /><span>Orders</span>
        </button>
        <span className="od-order-number">{order.orderNumber || order.id}</span>
      </div>

      <div className="od-body">
        {/* Status Banner */}
        <div className={`od-status-banner ${statusCls}`}>
          <span className="od-status-icon">{statusIcon}</span>
          <div>
            <div className="od-status-label">{statusLabel}</div>
            <div className="od-status-date">
              {cancelled
                ? `Cancelled on ${formatDate(order.updatedAt || order.createdAt)}`
                : (order.status === "delivered" || order.status === "completed")
                  ? `Delivered on ${formatDate(order.updatedAt || order.createdAt)}`
                  : `Placed on ${formatDate(order.createdAt)}`}
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        {!cancelled && order.paymentStatus !== "failed" && (
          <div className="od-card">
            <h2 className="od-card-title">Order Progress</h2>
            {order.returnInfo && (
              <div className="od-return-info-row">
                <span>Return reason: <strong>{order.returnInfo.reason}</strong></span>
                <span>Refund to: <strong>{order.returnInfo.refundTo === "wallet" ? "🪙 Shopper Wallet" : "🏦 Original Method"}</strong></span>
              </div>
            )}
            <OrderTimeline
              currentStep={trackingStep}
              createdAt={order.createdAt}
              cancelled={cancelled}
              returnInfo={order.returnInfo || null}
            />
          </div>
        )}

        {/* Items */}
        <div className="od-card">
          <h2 className="od-card-title">Items Ordered</h2>
          {order.items?.map((item, idx) => (
            <div key={idx} className="od-item-row">
              <div className="od-item-img-wrap">
                {item.image
                  ? <img src={item.image} alt={item.name} className="od-item-img" />
                  : <div className="od-item-img-placeholder"><FaBox /></div>
                }
              </div>
              <div className="od-item-info">
                <div className="od-item-name">{item.name}</div>
                <div className="od-item-meta">Qty: {item.quantity}&nbsp;•&nbsp;₹{item.price?.toLocaleString("en-IN")} each</div>
              </div>
              <div className="od-item-total">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="od-card">
          <h2 className="od-card-title">Price Details</h2>
          <div className="od-price-row"><span>Subtotal</span><span>₹{(order.totalPrice || 0).toLocaleString("en-IN")}</span></div>
          <div className="od-price-row"><span>Shipping</span><span className="od-free">FREE</span></div>
          <div className="od-price-row od-price-total"><span>Total Paid</span><span>₹{(order.totalPrice || 0).toLocaleString("en-IN")}</span></div>
        </div>

        {/* Payment & Delivery */}
        <div className="od-two-col">
          <div className="od-card">
            <h2 className="od-card-title">Payment Method</h2>
            <div className="od-payment-method">
              <span className="od-pay-icon">{getPaymentIcon(order.paymentMethod?.type)}</span>
              <div>
                <div className="od-pay-label">{getPaymentLabel(order.paymentMethod?.type)}</div>
                <div className={`od-pay-status ${order.paymentStatus === "completed" ? "od-pay-success" : "od-pay-fail"}`}>
                  {order.paymentStatus === "completed" ? "✓ Paid" : order.paymentStatus}
                </div>
              </div>
            </div>
          </div>

          <div className="od-card">
            <h2 className="od-card-title">Delivery Address</h2>
            <div className="od-address">
              <FaMapMarkerAlt className="od-address-icon" />
              <div>
                {order.shippingAddress?.address && order.shippingAddress.address !== "Default Address (LLM)" ? (
                  <>
                    <div>{order.shippingAddress.address}</div>
                    <div>{order.shippingAddress.city} {order.shippingAddress.state} {order.shippingAddress.zipCode}</div>
                  </>
                ) : (
                  <div className="od-no-address">No address saved</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="od-card od-info-grid">
          <div className="od-info-item">
            <div className="od-info-label">Order ID</div>
            <div className="od-info-value od-mono">{order.orderNumber || order.id}</div>
          </div>
          <div className="od-info-item">
            <div className="od-info-label">Order Date</div>
            <div className="od-info-value">{formatDate(order.createdAt)}</div>
          </div>
          <div className="od-info-item">
            <div className="od-info-label">Est. Delivery</div>
            <div className="od-info-value">{stepDate(order.createdAt, 4)}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="od-actions">
          {canCancel && !cancelled && (
            <button className="od-cancel-btn" onClick={handleCancelOrder}>Cancel Order</button>
          )}
          {order.paymentStatus === "failed" && order.canRetry && (
            <button className="od-retry-btn" onClick={handleRetryPayment}><FaRedo /> Retry Payment</button>
          )}
          {(order.status === "delivered" || order.status === "completed") && !order.returnInfo && (
            <button className="od-return-btn" onClick={handleRequestReturn}>↩ Request Return</button>
          )}
        </div>

        </div>

      <AlertDialog
        isOpen={alertConfig.isOpen} onClose={hideAlert} onConfirm={alertConfig.onConfirm}
        title={alertConfig.title} message={alertConfig.message} type={alertConfig.type}
        confirmText={alertConfig.confirmText} cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
      />

      {refundModal.isOpen && (
        <div className="od-modal-overlay">
          <div className="od-modal">
            <h2>Choose Refund Method</h2>
            <p>Where would you like your refund of <strong>₹{(order.totalPrice || 0).toLocaleString("en-IN")}</strong>?</p>
            <div className="od-refund-options">
              <button className="od-refund-btn" onClick={() => performCancellation("wallet")}>
                <strong>🪙 Wallet (Instant)</strong>
                <span>Credited instantly to Shopper Wallet</span>
              </button>
              <button className="od-refund-btn" onClick={() => performCancellation("source")}>
                <strong>🏦 Original Source</strong>
                <span>Refund to bank in 5–7 working days</span>
              </button>
            </div>
            <button className="od-modal-close" onClick={() => setRefundModal({ isOpen: false })}>Cancel</button>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {returnModal.isOpen && (
        <div className="od-modal-overlay">
          <div className="od-modal">
            <h2>↩ Request Return</h2>
            <p>We'll arrange a pickup within 24 hours of your request.</p>
            <div className="od-form-group">
              <label>Reason for return</label>
              <select value={returnForm.reason} onChange={e => setReturnForm(p => ({ ...p, reason: e.target.value }))} className="od-select">
                <option value="">Select a reason…</option>
                <option value="Wrong item received">Wrong item received</option>
                <option value="Damaged product">Damaged product</option>
                <option value="Not as described">Not as described</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Quality issue">Quality issue</option>
                <option value="Size/fit issue">Size / fit issue</option>
              </select>
            </div>
            <div className="od-form-group">
              <label>Refund to</label>
              <div className="od-refund-options">
                <button className={`od-refund-btn ${returnForm.refundTo === "wallet" ? "od-refund-selected" : ""}`} onClick={() => setReturnForm(p => ({ ...p, refundTo: "wallet" }))}>
                  <strong>🪙 Shopper Wallet</strong>
                  <span>Credited in ~2 days</span>
                </button>
                <button className={`od-refund-btn ${returnForm.refundTo === "original" ? "od-refund-selected" : ""}`} onClick={() => setReturnForm(p => ({ ...p, refundTo: "original" }))}>
                  <strong>🏦 Original Method</strong>
                  <span>5–7 working days</span>
                </button>
              </div>
            </div>
            <div className="od-modal-actions">
              <button className="od-retry-btn" onClick={performReturn}>Submit Return</button>
              <button className="od-modal-close" onClick={() => setReturnModal({ isOpen: false })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
