import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaFilter, FaTimes } from "react-icons/fa";
import ProductCard from "../components/ProductCard";
import productsData from "../data/productsData";
import "../css/CategoryPage.css";

const Clothes = () => {
  const [searchParams] = useSearchParams();
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 100000 });
  const [sortBy, setSortBy] = useState("popularity");
  const [message, setMessage] = useState("");

  const products = productsData.Clothes || [];
  const searchQuery = searchParams.get("search") || "";

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPrice =
      product.price >= priceFilter.min && product.price <= priceFilter.max;
    return matchesSearch && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  const showNotification = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="category-page">
      {message && <div className="notification">{message}</div>}
      <div className="category-header">
        <h1>Clothes</h1>
        <span className="product-count">{sortedProducts.length} products</span>
      </div>

      <div className="category-container">
        <div className="filters-sidebar">
          <div className="filter-section">
            <h3>
              <FaFilter /> Filters
            </h3>
            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
            <div className="filter-group">
              <label>
                Price Range: ₹{priceFilter.min} - ₹{priceFilter.max}
              </label>
              <input
                type="range"
                min="0"
                max="100000"
                value={priceFilter.max}
                onChange={(e) =>
                  setPriceFilter({
                    ...priceFilter,
                    max: parseInt(e.target.value),
                  })
                }
                className="price-slider"
              />
            </div>
          </div>
        </div>

        <div className="products-section">
          {sortedProducts.length > 0 ? (
            <div className="products-grid">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showNotification={showNotification}
                />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <FaTimes className="no-icon" />
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clothes;
