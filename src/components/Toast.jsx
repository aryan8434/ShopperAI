import React, { useState, useEffect, useCallback } from "react";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import "../css/Toast.css";

// ── Singleton event bus ────────────────────────────────────────────
const listeners = new Set();
let toastId = 0;

export const toast = {
  success: (msg) => emit("success", msg),
  error:   (msg) => emit("error",   msg),
  info:    (msg) => emit("info",    msg),
};

function emit(type, message) {
  const id = ++toastId;
  listeners.forEach(fn => fn({ id, type, message }));
}

// ── Provider / Root ────────────────────────────────────────────────
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (t) => {
      setToasts(prev => [...prev.slice(-4), t]);     // keep max 5
      setTimeout(() => remove(t.id), 4000);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, [remove]);

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            {t.type === "success" && <FaCheckCircle />}
            {t.type === "error"   && <FaTimesCircle />}
            {t.type === "info"    && <FaInfoCircle />}
          </span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => remove(t.id)}>
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
