import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaClock,
  FaCheck,
  FaTimes,
  FaChevronRight,
  FaShoppingBag,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "../services/ShoppingService";
import Loading from "../components/Loading";
import "../css/Orders.css";

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const sorted = userOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt?.toDate?.() || a.createdAt || 0);
        const dateB = new Date(b.createdAt?.toDate?.() || b.createdAt || 0);
        return dateB - dateA;
      });
      setOrders(sorted);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateVal) => {
    try {
      if (!dateVal) return "N/A";
      const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusMeta = (status, paymentStatus) => {
    if (paymentStatus === "failed") return { label: "Payment Failed", cls: "s-failed", icon: <FaTimes /> };
    switch (status) {
      case "processing": return { label: "Processing", cls: "s-processing", icon: <FaClock /> };
      case "shipped":    return { label: "Shipped", cls: "s-shipped", icon: <FaBox /> };
      case "delivered":  return { label: "Delivered", cls: "s-delivered", icon: <FaCheck /> };
      case "completed":  return { label: "Completed", cls: "s-completed", icon: <FaCheck /> };
      case "cancelled":  return { label: "Cancelled", cls: "s-cancelled", icon: <FaTimes /> };
      default:           return { label: status, cls: "s-processing", icon: <FaClock /> };
    }
  };

  if (loading) return <Loading message="Loading your orders..." size="large" />;

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-header">
          <h1>My Orders</h1>
        </div>
        <div className="orders-empty">
          <FaShoppingBag className="empty-icon" />
          <h2>No orders yet</h2>
          <p>Start shopping to see your orders here.</p>
          <button className="start-shopping-btn" onClick={() => navigate("/")}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        <span className="orders-count">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const { label, cls, icon } = getStatusMeta(order.status, order.paymentStatus);
          const previewItems = order.items?.slice(0, 3) || [];
          const extraCount = (order.items?.length || 0) - 3;

          return (
            <div
              key={order.id}
              className="order-card"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              {/* Left: Product images */}
              <div className="oc-images-col">
                {previewItems.map((item, idx) =>
                  item.image ? (
                    <img key={idx} src={item.image} alt={item.name} className="oc-product-img" />
                  ) : (
                    <div key={idx} className="oc-product-img-placeholder">
                      <FaBox />
                    </div>
                  )
                )}
                {extraCount > 0 && (
                  <div className="oc-extra-count">+{extraCount}</div>
                )}
              </div>

              {/* Middle: Order info */}
              <div className="oc-info-col">
                <div className="oc-order-name">
                  {previewItems[0]?.name
                    ? previewItems[0].name.length > 40
                      ? previewItems[0].name.slice(0, 40) + "…"
                      : previewItems[0].name
                    : "Order"}
                  {order.items?.length > 1 && (
                    <span className="oc-more-items"> & {order.items.length - 1} more item{order.items.length - 1 !== 1 ? "s" : ""}</span>
                  )}
                </div>
                <div className="oc-order-meta">
                  <span className="oc-order-num">{order.orderNumber || order.id}</span>
                  <span className="oc-dot">•</span>
                  <span className="oc-date">{formatDate(order.createdAt)}</span>
                </div>
                <div className="oc-total">
                  ₹{(order.totalPrice || 0).toLocaleString("en-IN")}
                </div>
              </div>

              {/* Right: Status + Arrow */}
              <div className="oc-status-col">
                <div className={`oc-status ${cls}`}>
                  {icon}
                  <span>{label}</span>
                </div>
                <FaChevronRight className="oc-arrow" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
