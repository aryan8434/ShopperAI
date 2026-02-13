import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import productsData from "../data/productsData";
import "../css/Home.css";

const Products = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Get all products from all categories
    let products = [];
    Object.values(productsData).forEach((categoryProducts) => {
      if (Array.isArray(categoryProducts)) {
        products = products.concat(categoryProducts);
      }
    });
    setAllProducts(products);
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
          <h1>All Products</h1>
          <p>Explore our complete collection of products</p>
        </div>
      </div>

      <div className="featured-section">
        <h2>Complete Product Catalog</h2>
        <div className="products-showcase-grid">
          {allProducts.map((product) => (
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

export default Products;
