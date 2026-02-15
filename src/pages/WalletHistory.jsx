import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaWallet, FaPlus, FaMinus, FaUndo } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../css/WalletHistory.css";

const WalletHistory = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadWalletHistory();
  }, [user, navigate]);

  const loadWalletHistory = () => {
    if (userData?.walletTransactions) {
      // Sort transactions by timestamp (newest first)
      const sortedTransactions = [...userData.walletTransactions].sort(
        (a, b) => {
          const dateA = a.timestamp?.toDate
            ? a.timestamp.toDate()
            : new Date(a.timestamp);
          const dateB = b.timestamp?.toDate
            ? b.timestamp.toDate()
            : new Date(b.timestamp);
          return dateB - dateA;
        },
      );
      setTransactions(sortedTransactions);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    try {
      let date;
      if (dateString && dateString.toDate) {
        // Firestore Timestamp
        date = dateString.toDate();
      } else {
        // Regular Date string or Date object
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "credit":
        return <FaPlus className="transaction-icon credit" />;
      case "debit":
        return <FaMinus className="transaction-icon debit" />;
      case "refund":
        return <FaUndo className="transaction-icon refund" />;
      default:
        return <FaWallet className="transaction-icon" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "credit":
        return "transaction-credit";
      case "debit":
        return "transaction-debit";
      case "refund":
        return "transaction-refund";
      default:
        return "transaction-default";
    }
  };

  if (loading) {
    return (
      <div className="wallet-history-container">
        <div className="loading">Loading wallet history...</div>
      </div>
    );
  }

  return (
    <div className="wallet-history-container">
      <div className="wallet-history-header">
        <button className="back-btn" onClick={() => navigate("/profile")}>
          <FaArrowLeft /> Back to Profile
        </button>
        <h1>Wallet History</h1>
        <div className="current-balance">
          <FaWallet />
          <span>
            Current Balance: ₹
            {(userData?.paymentMethods?.wallet || 0).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="transactions-section">
        <h2>Transaction History</h2>

        {transactions.length === 0 ? (
          <div className="no-transactions">
            <FaWallet className="empty-icon" />
            <p>No transactions yet</p>
            <small>Your wallet transaction history will appear here</small>
          </div>
        ) : (
          <div className="transactions-list">
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className={`transaction-item ${getTransactionColor(transaction.type)}`}
              >
                <div className="transaction-icon">
                  {getTransactionIcon(transaction.type)}
                </div>

                <div className="transaction-details">
                  <div className="transaction-main">
                    <h4>{transaction.description}</h4>
                    <p className="transaction-date">
                      {formatDate(transaction.timestamp)}
                    </p>
                  </div>

                  {transaction.orderId && (
                    <div className="transaction-order">
                      <span>Order ID: {transaction.orderId}</span>
                    </div>
                  )}
                </div>

                <div className="transaction-amount">
                  <span className={`amount ${transaction.type}`}>
                    {transaction.type === "debit" ? "-" : "+"}₹
                    {transaction.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletHistory;
