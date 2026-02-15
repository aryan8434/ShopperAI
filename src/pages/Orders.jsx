import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBox, FaClock, FaCheck, FaRedo, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import {
  getUserOrders,
  retryOrderPayment,
  cancelOrder,
} from "../services/ShoppingService";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import AlertDialog from "../components/AlertDialog";
import Loading from "../components/Loading";
import useAlert from "../hooks/useAlert";
import "../css/Orders.css";

const Orders = () => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const { alertConfig, showAlert, hideAlert, confirm } = useAlert();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const userOrders = await getUserOrders(user.uid);
      console.log("Loaded orders:", userOrders); // Debug log
      const sortedOrders = userOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.orderDate || 0);
        const dateB = new Date(b.createdAt || b.orderDate || 0);
        return dateB - dateA;
      });
      setOrders(sortedOrders);
      setLoading(false);
    } catch (error) {
      console.error("Error loading orders:", error);
      showAlert({
        title: "Error",
        message: "Failed to load orders. Please try again.",
        type: "error",
      });
      setLoading(false);
    }
  };

  const handleRetryPayment = async (orderId) => {
    try {
      const result = await retryOrderPayment(user.uid, orderId);
      if (result.success) {
        showAlert({
          title: "Success",
          message: `Payment successful! New wallet balance: ₹${result.newBalance}`,
          type: "success",
        });
        await refreshUserData(); // Refresh userData to sync wallet balance
        await loadOrders();
      } else {
        showAlert({
          title: "Payment Failed",
          message: result.error,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error retrying payment:", error);
      showAlert({
        title: "Error",
        message: "Failed to retry payment. Please try again.",
        type: "error",
      });
    }
  };

  const [refundModal, setRefundModal] = useState({
    isOpen: false,
    order: null,
  });

  const processWalletRefund = async (order) => {
    try {
      const refundAmount = order.totalPrice || order.totalAmount || 0;
      const transaction = {
        id: Date.now(),
        type: "refund",
        amount: refundAmount,
        description: `Refund for Order ${order.orderNumber || order.orderId}`,
        timestamp: new Date(),
        orderId: order.orderNumber || order.orderId,
      };

      // Update user wallet
      const userRef = doc(db, "users", user.uid);
      // We need to fetch current data to ensure atomic update of balance if possible, 
      // or rely on previous userData but separate write is safer. 
      // Since we have refreshUserData, we can just do a transactional update or similar.
      // specific instruction: "add money to wallet also history should mention that which order id"
      
      // We'll read the latest user doc to get current balance to be safe
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
         const currentData = userSnap.data();
         const currentBalance = currentData.paymentMethods?.wallet || 0;
         const newBalance = currentBalance + refundAmount;
         
         await updateDoc(userRef, {
            "paymentMethods.wallet": newBalance,
            "walletTransactions": [transaction, ...(currentData.walletTransactions || [])]
         });
         await refreshUserData();
      }

      return true;
    } catch (error) {
      console.error("Error processing wallet refund:", error);
      return false;
    }
  };

  const handleCancelOrder = async (orderId) => {
    const orderToCancel = orders.find(o => (o.id === orderId || o.orderId === orderId));
    if (!orderToCancel) return;

    const confirmed = await confirm({
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order? This action cannot be undone.",
      confirmText: "Yes, Cancel Order",
      cancelText: "Keep Order",
    });

    if (!confirmed) return;

    // Check Payment Method
    const paymentType = orderToCancel.paymentMethod?.type;

    if (paymentType === 'wallet') {
        // Direct Refund to Wallet
        await performCancellation(orderToCancel, "wallet");
    } else {
        // Ask for Refund Method (Card/UPI)
        setRefundModal({
            isOpen: true,
            order: orderToCancel
        });
    }
  };

  const performCancellation = async (order, refundDest) => {
      try {
          setLoading(true);
          await cancelOrder(user.uid, order.id || order.orderId);

          let message = "Your order has been cancelled successfully.";

          if (refundDest === 'wallet') {
             const success = await processWalletRefund(order);
             if (success) {
                 const amount = order.totalPrice || order.totalAmount || 0;
                 if (order.paymentMethod?.type === 'wallet') {
                     message = `Order cancelled. ₹${amount.toLocaleString("en-IN")} has been refunded to your wallet.`;
                 } else {
                     message = `Order cancelled. Payment of ₹${amount.toLocaleString("en-IN")} added to wallet.`;
                 }
             }
          } else if (refundDest === 'source') {
              message = "Order cancelled. Payment added to source and would be added in 5-7 days.";
          }

          setRefundModal({ isOpen: false, order: null });
          await loadOrders();
          
          showAlert({
            title: "Order Cancelled",
            message: message,
            type: "success",
          });
      } catch (error) {
          console.error("Error cancelling order:", error);
          showAlert({
            title: "Error",
            message: "Failed to cancel order. Please try again.",
            type: "error",
          });
          setLoading(false);
      }
  };

  const getStatusColor = (status, paymentStatus) => {
    if (paymentStatus === "failed") return "status-failed";
    switch (status) {
      case "processing":
        return "status-processing";
      case "shipped":
        return "status-shipped";
      case "delivered":
        return "status-delivered";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-processing";
    }
  };

  const getStatusIcon = (status, paymentStatus) => {
    if (paymentStatus === "failed") return <FaTimes />;
    switch (status) {
      case "delivered":
      case "completed":
        return <FaCheck />;
      case "shipped":
        return <FaBox />;
      case "cancelled":
        return <FaTimes />;
      default:
        return <FaClock />;
    }
  };

  const getStatusText = (status, paymentStatus) => {
    if (paymentStatus === "failed") return "Payment Failed";
    if (paymentStatus === "pending") return "Payment Pending";
    switch (status) {
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      let date;
      if (dateString.toDate) {
        // Firestore Timestamp
        date = dateString.toDate();
      } else {
        // Regular Date string or Date object
        date = new Date(dateString);
      }
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "N/A";
    }
  };

  if (loading) {
    return <Loading message="Loading your orders..." size="large" />;
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <div className="empty-orders">
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet. Start shopping now!</p>
          <button className="shop-btn" onClick={() => navigate("/")}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>

      <div className="orders-content">
        <div className="orders-list">
          {orders.map((order) => (
            <div
              key={order.id || order.orderId}
              className={`order-card ${
                selectedOrder?.id === order.id ||
                selectedOrder?.orderId === order.orderId
                  ? "active"
                  : ""
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="order-header">
                <h3>{order.orderNumber || order.orderId || "N/A"}</h3>
                <span
                  className={`status ${getStatusColor(order.status, order.paymentStatus)}`}
                >
                  {getStatusIcon(order.status, order.paymentStatus)}{" "}
                  {getStatusText(order.status, order.paymentStatus)}
                </span>
              </div>

              <div className="order-info">
                <p>
                  <strong>Date:</strong>{" "}
                  {formatDate(order.createdAt || order.orderDate)}
                </p>
                <p>
                  <strong>Items:</strong> {order.items?.length || 0}
                </p>
                <p className="order-amount">
                  <strong>Total:</strong> ₹
                  {(order.totalPrice || order.totalAmount || 0).toLocaleString(
                    "en-IN",
                  )}
                </p>
                {order.paymentStatus === "failed" && order.canRetry && (
                  <button
                    className="retry-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetryPayment(order.id);
                    }}
                  >
                    <FaRedo /> Retry Payment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedOrder && (
          <div className="order-details">
            <h2>Order Details</h2>

            <div className="detail-section">
              <h3>Order Information</h3>
              <div className="detail-row">
                <span>Order ID:</span>
                <span className="order-id">
                  {selectedOrder.orderNumber || selectedOrder.orderId}
                </span>
              </div>
              <div className="detail-row">
                <span>Order Date:</span>
                <span>
                  {formatDate(
                    selectedOrder.createdAt || selectedOrder.orderDate,
                  )}
                </span>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <span
                  className={`status ${getStatusColor(selectedOrder.status, selectedOrder.paymentStatus)}`}
                >
                  {getStatusIcon(
                    selectedOrder.status,
                    selectedOrder.paymentStatus,
                  )}{" "}
                  {getStatusText(
                    selectedOrder.status,
                    selectedOrder.paymentStatus,
                  )}
                </span>
              </div>
              <div className="detail-row">
                <span>Payment Method:</span>
                <span>{selectedOrder.paymentMethod?.type || "N/A"}</span>
              </div>
              {selectedOrder.paymentStatus === "failed" && (
                <div className="detail-row">
                  <span>Payment Status:</span>
                  <span className="status status-failed">
                    <FaTimes /> Payment Failed - Insufficient Balance
                  </span>
                </div>
              )}
              {selectedOrder.paymentStatus === "failed" &&
                selectedOrder.canRetry && (
                  <div className="detail-row">
                    <button
                      className="retry-btn"
                      onClick={() => handleRetryPayment(selectedOrder.id)}
                    >
                      <FaRedo /> Retry Payment
                    </button>
                  </div>
                )}
            </div>

            <div className="detail-section">
              <h3>Items</h3>
              {selectedOrder.items.map((item) => (
                <div key={item.productId} className="order-item-detail">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p className="item-category">{item.category}</p>
                    <p className="item-id">Product ID: {item.productId}</p>
                  </div>
                  <div className="item-qty">
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    <p>₹{item.price.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="item-total">
                    <p>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="detail-section">
              <h3>Payment & Totals</h3>
              <div className="detail-row">
                <span>Payment Method:</span>
                <span>
                  {selectedOrder.paymentMethod?.type === "wallet"
                    ? "Digital Wallet"
                    : selectedOrder.paymentMethod?.type === "credit_card"
                      ? "Credit/Debit Card"
                      : selectedOrder.paymentMethod?.type === "upi"
                        ? "UPI"
                        : "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span>Payment Status:</span>
                <span className="paid">{selectedOrder.paymentStatus}</span>
              </div>
              {selectedOrder.shippingAddress && (
                <div className="detail-row">
                  <span>Shipping Address:</span>
                  <span>
                    {selectedOrder.shippingAddress.address || "N/A"},{" "}
                    {selectedOrder.shippingAddress.city || ""}{" "}
                    {selectedOrder.shippingAddress.state || ""}{" "}
                    {selectedOrder.shippingAddress.zipCode || ""}
                  </span>
                </div>
              )}
              <div className="detail-row">
                <span>Total Amount:</span>
                <span className="total-amount">
                  ₹
                  {(
                    selectedOrder.totalPrice ||
                    selectedOrder.totalAmount ||
                    0
                  ).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              className="back-detail-btn"
              onClick={() => setSelectedOrder(null)}
            >
              Back to Orders
            </button>

            {selectedOrder.status === "processing" && (
              <button
                className="cancel-btn"
                onClick={() => handleCancelOrder(selectedOrder.id)}
              >
                Cancel Order
              </button>
            )}
          </div>
        )}
      </div>

      <AlertDialog
        isOpen={alertConfig.isOpen}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
      />

      {/* Refund Selection Modal */}
      {refundModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content refund-modal">
            <h2>Refund Method</h2>
            <p>Where would you like your refund of <strong>₹{(refundModal.order?.totalPrice || refundModal.order?.totalAmount || 0).toLocaleString("en-IN")}</strong> to be credited?</p>
            
            <div className="refund-options">
              <button 
                className="refund-btn wallet"
                onClick={() => performCancellation(refundModal.order, 'wallet')}
              >
                 <div className="btn-content">
                    <strong>Wallet (Instant)</strong>
                    <span>Get refund instantly to your Shopper Wallet</span>
                 </div>
              </button>
              
              <button 
                className="refund-btn source"
                onClick={() => performCancellation(refundModal.order, 'source')}
              >
                 <div className="btn-content">
                    <strong>Original Source</strong>
                    <span>Refund to bank account in 5-7 days</span>
                 </div>
              </button>
            </div>

            <button 
              className="close-modal-btn"
              onClick={() => setRefundModal({ isOpen: false, order: null })}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
