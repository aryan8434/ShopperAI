import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBox, FaClock, FaCheck } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getUserOrders, cancelOrder } from "../services/OrderService";
import AlertDialog from "../components/AlertDialog";
import Loading from "../components/Loading";
import useAlert from "../hooks/useAlert";
import "../css/Orders.css";

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      setOrders(userOrders.reverse()); // Show latest first
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

  const handleCancelOrder = async (orderId) => {
    const confirmed = await confirm(
      "Are you sure you want to cancel this order? This action cannot be undone.",
      "Cancel Order",
    );

    if (!confirmed) return;

    const result = await cancelOrder(user.uid, orderId);
    if (result.success) {
      showAlert({
        title: "Success",
        message: "Order cancelled successfully",
        type: "success",
      });
      await loadOrders();
      setSelectedOrder(null);
    } else {
      showAlert({
        title: "Error",
        message: `Error: ${result.error}`,
        type: "error",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "status-processing";
      case "shipped":
        return "status-shipped";
      case "delivered":
        return "status-delivered";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-processing";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FaCheck />;
      case "shipped":
        return <FaBox />;
      default:
        return <FaClock />;
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
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
              key={order.orderId}
              className={`order-card ${
                selectedOrder?.orderId === order.orderId ? "active" : ""
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="order-header">
                <h3>{order.orderId || "N/A"}</h3>
                <span
                  className={`status ${getStatusColor(order.deliveryStatus || "processing")}`}
                >
                  {getStatusIcon(order.deliveryStatus || "processing")}{" "}
                  {order.deliveryStatus || "processing"}
                </span>
              </div>

              <div className="order-info">
                <p>
                  <strong>Date:</strong> {formatDate(order.orderDate)}
                </p>
                <p>
                  <strong>Items:</strong> {order.items?.length || 0}
                </p>
                <p className="order-amount">
                  <strong>Total:</strong> ₹
                  {(order.totalAmount || 0).toLocaleString("en-IN")}
                </p>
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
                <span className="order-id">{selectedOrder.orderId}</span>
              </div>
              <div className="detail-row">
                <span>Order Date:</span>
                <span>{formatDate(selectedOrder.orderDate)}</span>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <span
                  className={`status ${getStatusColor(selectedOrder.deliveryStatus)}`}
                >
                  {getStatusIcon(selectedOrder.deliveryStatus)}{" "}
                  {selectedOrder.deliveryStatus}
                </span>
              </div>
              <div className="detail-row">
                <span>Expected Delivery:</span>
                <span>{formatDate(selectedOrder.estimatedDelivery)}</span>
              </div>
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
                  {selectedOrder.paymentMethod === "dummy_payment"
                    ? "Dummy Payment"
                    : selectedOrder.paymentMethod}
                </span>
              </div>
              <div className="detail-row">
                <span>Payment Status:</span>
                <span className="paid">{selectedOrder.paymentStatus}</span>
              </div>
              <div className="detail-row">
                <span>Total Amount:</span>
                <span className="total-amount">
                  ₹{selectedOrder.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {selectedOrder.deliveryStatus !== "delivered" &&
              selectedOrder.deliveryStatus !== "cancelled" && (
                <button
                  className="cancel-btn"
                  onClick={() => handleCancelOrder(selectedOrder.orderId)}
                >
                  Cancel Order
                </button>
              )}

            <button
              className="back-detail-btn"
              onClick={() => setSelectedOrder(null)}
            >
              Back to Orders
            </button>
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
    </div>
  );
};

export default Orders;
