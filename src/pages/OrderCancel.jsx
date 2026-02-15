import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaWallet,
  FaCreditCard,
} from "react-icons/fa";
import { cancelOrder, getOrderById } from "../services/ShoppingService";
import "../css/OrderSuccess.css";

const OrderCancel = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [showRefundChoice, setShowRefundChoice] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderData = await getOrderById(orderId);
        setOrder(orderData);

        // If payment was made with wallet, proceed directly
        if (orderData.paymentMethod?.type === "wallet") {
          await performCancellation();
        } else {
          // For card/UPI payments, show refund choice
          setShowRefundChoice(true);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading order:", err);
        setError("Failed to load order details. Please try again.");
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const performCancellation = async (refundMethod = null) => {
    try {
      setLoading(true);
      await cancelOrder(orderId, refundMethod);
      setCancelled(true);
    } catch (err) {
      console.error("Error cancelling order:", err);
      setError("Failed to cancel order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefundChoice = (refundMethod) => {
    performCancellation(refundMethod);
  };

  if (loading) {
    return (
      <div className="order-success-container">
        <div className="success-card">
          <div className="success-icon loading">
            <FaTimesCircle />
          </div>
          <h1>Cancelling Order...</h1>
          <p>Please wait while we cancel your order.</p>
        </div>
      </div>
    );
  }

  if (showRefundChoice) {
    return (
      <div className="order-success-container">
        <div className="success-card">
          <div className="success-icon">
            <FaTimesCircle />
          </div>
          <h1>Cancel Order</h1>
          <p>How would you like to receive your refund?</p>

          <div className="refund-options">
            <button
              className="refund-option wallet"
              onClick={() => handleRefundChoice("wallet")}
            >
              <FaWallet />
              <div>
                <h3>Refund to Wallet</h3>
                <p>Money will be added back to your wallet instantly</p>
              </div>
            </button>

            <button
              className="refund-option card"
              onClick={() => handleRefundChoice("card")}
            >
              <FaCreditCard />
              <div>
                <h3>Refund to Card</h3>
                <p>
                  Money will be refunded back to your original payment method
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-success-container">
        <div className="success-card">
          <div className="success-icon error">
            <FaTimesCircle />
          </div>
          <h1>Cancellation Failed</h1>
          <p>{error}</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="success-card">
        <div className="success-icon cancelled">
          <FaTimesCircle />
        </div>

        <h1>Order Cancelled Successfully!</h1>
        <p>
          Your order has been cancelled. Any payments will be refunded within
          3-5 business days.
        </p>

        <div className="order-confirmation">
          <div className="confirmation-row">
            <span>Order ID:</span>
            <span className="order-number">{orderId}</span>
          </div>
          <div className="confirmation-row">
            <span>Status:</span>
            <span className="cancelled-status">Cancelled</span>
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
      </div>
    </div>
  );
};

export default OrderCancel;
