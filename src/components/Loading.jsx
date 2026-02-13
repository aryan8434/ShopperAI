import React from "react";
import "../css/Loading.css";

const Loading = ({
  message = "Loading...",
  size = "medium",
  overlay = false,
}) => {
  const containerClass = overlay ? "loading-overlay" : "loading-container";

  return (
    <div className={containerClass}>
      <div className={`loading-spinner ${size}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-center"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default Loading;
