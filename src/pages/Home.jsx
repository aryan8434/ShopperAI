import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import productsData from "../data/productsData";
import "../css/Home.css";

const Home = () => {
  const [randomProducts, setRandomProducts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Get all products from all categories
    let allProducts = [];
    Object.values(productsData).forEach((categoryProducts) => {
      if (Array.isArray(categoryProducts)) {
        allProducts = allProducts.concat(categoryProducts);
      }
    });

    // Shuffle and get 30 random products
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
          <p>Now you can place order, cancel order and add items to cart by just chatting with our AI chatbot </p>
        </div>
      </div>

      <div className="featured-section">
        <h2>Explore Products</h2>
        <div className="products-showcase-grid">
          {randomProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showNotification={showNotification}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
