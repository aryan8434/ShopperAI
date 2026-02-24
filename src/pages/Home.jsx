import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import productsData from "../data/productsData";
import "../css/Home.css";

const RecentlyViewed = () => {
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem("shopper_recent") || "[]"));
    } catch { setRecent([]); }
  }, []);

  if (recent.length === 0) return null;

  return (
    <div className="recently-section">
      <h2 className="recently-title">🕐 Recently Viewed</h2>
      <div className="recently-scroll">
        {recent.map(p => (
          <div key={p.id} className="recently-card" onClick={() => navigate(`/product/${p.id}`)}>
            <img src={p.image} alt={p.name} className="recently-img" />
            <div className="recently-info">
              <div className="recently-name">{p.name}</div>
              <div className="recently-price">₹{p.price.toLocaleString("en-IN")}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const [randomProducts, setRandomProducts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let allProducts = [];
    Object.values(productsData).forEach((cat) => {
      if (Array.isArray(cat)) allProducts = allProducts.concat(cat);
    });
    const shuffled = allProducts.sort(() => Math.random() - 0.5);
    setRandomProducts(shuffled.slice(0, 30));
  }, []);

  const showNotification = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="home-container">
      {message && <div className="notification">{message}</div>}

      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Shopper AI</h1>
          <p>Find everything you need at the best prices</p>
          <p>Now you can place order, cancel order and add items to cart by just chatting with our AI chatbot</p>
        </div>
      </div>

      {/* Recently Viewed row */}
      <RecentlyViewed />

      <div className="featured-section">
        <h2>Explore Products</h2>
        <div className="products-showcase-grid">
          {randomProducts.map((product) => (
            <ProductCard key={product.id} product={product} showNotification={showNotification} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
