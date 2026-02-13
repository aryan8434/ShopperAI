import React, { useState } from "react";
import { FaCheckCircle, FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../css/Contact.css";

const Contact = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Simulate sending message
    console.log("Message sent:", {
      user: user?.displayName || "Guest",
      email: user?.email,
      message: message,
    });

    setSubmitted(true);
    setMessage("");

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Get in touch with us!</p>
      </div>

      <div className="contact-content">
        <div className="contact-info-card">
          <h2>Get in Touch</h2>
          <div className="info-item">
            <FaPhone className="info-icon" />
            <div>
              <h3>Phone</h3>
              <p>+91 9876543210</p>
            </div>
          </div>
          <div className="info-item">
            <FaEnvelope className="info-icon" />
            <div>
              <h3>Email</h3>
              <p>arkrraj@gmail.com</p>
            </div>
          </div>
          <div className="info-item">
            <FaMapMarkerAlt className="info-icon" />
            <div>
              <h3>Office</h3>
              <p>Shopper Headquarters, New Delhi, India</p>
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Send a Message</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                value={user ? user.displayName : "Guest (Please Login)"}
                disabled
                title="Name is fetched from your profile"
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                rows="6"
                placeholder="How can we help you?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-btn" disabled={!user}>
              {submitted ? "Message Sent!" : "Send Message"}
            </button>
            {!user && (
              <p className="login-hint">
                You must be logged in to send a message.
              </p>
            )}
            {submitted && (
              <div className="success-message">
                 <FaCheckCircle /> We've received your message!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
