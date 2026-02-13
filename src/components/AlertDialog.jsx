import React from "react";
import { FaTimes, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import "../css/AlertDialog.css";

const AlertDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheck className="alert-icon success" />;
      case "error":
        return <FaExclamationTriangle className="alert-icon error" />;
      case "warning":
        return <FaExclamationTriangle className="alert-icon warning" />;
      default:
        return <FaExclamationTriangle className="alert-icon info" />;
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="alert-dialog-overlay" onClick={handleBackdropClick}>
      <div className="alert-dialog">
        <div className="alert-dialog-header">
          {getIcon()}
          <button className="alert-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="alert-dialog-body">
          <h3 className="alert-title">{title}</h3>
          <p className="alert-message">{message}</p>
        </div>

        <div className="alert-dialog-footer">
          {showCancel && (
            <button className="alert-btn cancel-btn" onClick={handleCancel}>
              {cancelText}
            </button>
          )}
          <button className="alert-btn confirm-btn" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
