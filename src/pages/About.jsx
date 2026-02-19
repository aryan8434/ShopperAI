import React from "react";
import { FaShippingFast, FaTags, FaHeadset } from "react-icons/fa";
import "../css/About.css";

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <h1>About Shopper AI</h1>
        <p>
          Your one-stop destination for quality products at unbeatable prices.
          We bring the market to your fingertips.
        </p>
      </div>

      {/* Features Section */}
      <section className="about-features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaTags className="feature-icon" />
            <h3>Cheapest Prices</h3>
            <p>
              We pride ourselves on offering a wide range of products at the most
              competitive prices in the market. Shop more, save more!
            </p>
          </div>
          <div className="feature-card">
            <FaShippingFast className="feature-icon" />
            <h3>Fast Delivery</h3>
            <p>
              Experience lightning-fast delivery services. We ensure your
              products reach you safely and on time, every time.
            </p>
          </div>
          <div className="feature-card">
            <FaHeadset className="feature-icon" />
            <h3>24/7 Support</h3>
            <p>
              Our dedicated customer support team is available round the clock to
              assist you with any queries or concerns.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
