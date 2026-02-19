import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaCheckCircle, FaBox, FaClock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../css/OrderSuccess.css";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const orderFromState = location.state?.order;

  const [fetchedOrder, setFetchedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      if (!orderFromState && orderId && user?.uid) {
        try {
          // Try user subcollection first
          const docRef = doc(db, "users", user.uid, "orders", orderId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
             setFetchedOrder({ id: docSnap.id, ...docSnap.data() });
          } else {
             // Fallback to old global collection
             const globalRef = doc(db, "orders", orderId);
             const globalSnap = await getDoc(globalRef);
             if (globalSnap.exists()) {
                setFetchedOrder({ id: globalSnap.id, ...globalSnap.data() });
             }
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (!orderFromState && orderId) {
      fetchOrder();
    } else {
      setLoading(false); // If order is already in state, no need to fetch
    }
  }, [user, navigate, orderFromState, orderId]);

  const order = orderFromState || fetchedOrder;

  if (loading) {
    return (
      <div className="order-success-container">
        <div className="loading-message">
          <h2>Loading order details...</h2>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-success-container">
        <div className="error-message">
          <h2>Order information not found</h2>
          <button onClick={() => navigate("/orders")}>View My Orders</button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    let date;
    if (dateString.toDate) {
      date = dateString.toDate();
    } else {
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
  };

  return (
    <div className="order-success-container">
      <div className="success-card">
        <div className="success-icon">
          <FaCheckCircle />
        </div>

        <h1>Order Placed Successfully!</h1>
        <p className="success-message">
          Thank you for your order. Your order has been confirmed.
        </p>

        <div className="order-confirmation">
          <div className="confirmation-row">
            <span>Order Number:</span>
            <span className="order-number">{order.orderNumber || order.orderId}</span>
          </div>

          <div className="confirmation-row">
            <span>Order Date:</span>
            <span>{formatDate(order.createdAt || order.orderDate)}</span>
          </div>

          <div className="confirmation-row">
            <span>Estimated Delivery:</span>
            <span className="delivery-date">
              {formatDate(order.estimatedDelivery)}
            </span>
          </div>

          <div className="confirmation-row total">
            <span>Total Amount:</span>
            <span>
              ₹
              {(order.totalPrice || order.totalAmount || 0).toLocaleString(
                "en-IN",
              )}
            </span>
          </div>
        </div>

        <div className="order-items-preview">
          <h3>Items in Your Order</h3>
          <div className="items-list">
            {order.items.map((item) => (
              <div key={item.productId} className="preview-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-info">
                  <p className="item-name">{item.name}</p>
                  <p className="item-qty">Quantity: {item.quantity}</p>
                </div>
                <div className="item-price">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-timeline">
          <h3>Order Status</h3>
          <div className="timeline">
            <div className="timeline-item completed">
              <FaCheckCircle className="timeline-icon" />
              <div className="timeline-content">
                <h4>Order Confirmed</h4>
                <p>{formatDate(order.createdAt || order.orderDate)}</p>
              </div>
            </div>

            <div className="timeline-item">
              <FaBox className="timeline-icon" />
              <div className="timeline-content">
                <h4>Processing</h4>
                <p>Your order is being prepared</p>
              </div>
            </div>

            <div className="timeline-item">
              <FaBox className="timeline-icon" />
              <div className="timeline-content">
                <h4>Shipped</h4>
                <p>On the way to you</p>
              </div>
            </div>

            <div className="timeline-item">
              <FaCheckCircle className="timeline-icon" />
              <div className="timeline-content">
                <h4>Delivered</h4>
                <p>Expected by {formatDate(order.estimatedDelivery)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <button
            className="view-orders-btn"
            onClick={() => navigate("/orders")}
          >
            View My Orders
          </button>

          <button
            className="continue-shopping-btn"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>

        <div className="confirmation-email">
          <p>A confirmation email has been sent to {user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
