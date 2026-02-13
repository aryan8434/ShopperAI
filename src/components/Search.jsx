import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes, FaChevronDown } from "react-icons/fa";
import productsData from "../data/productsData";
import AlertDialog from "./AlertDialog";
import useAlert from "../hooks/useAlert";
import "../css/Search.css";

import { getCategoryFromLLM } from "../services/GroqService";

const Searchbar = ({ setResults }) => {
  const navigate = useNavigate();
  const { alertConfig, showAlert, hideAlert } = useAlert();
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "All Products",
    "Electronics",
    "Clothes",
    "Books",
    "Home & Garden",
    "Sports",
    "Beauty",
    "Toys",
  ];

  const categoryRoutes = {
    Electronics: "/electronics",
    Clothes: "/clothes",
    Books: "/books",
    "Home & Garden": "/home-garden",
    Sports: "/sports",
    Beauty: "/beauty",
    Toys: "/toys",
  };

  const handleChange = (value) => {
    setInput(value);
    if (!value.trim() && setResults) {
      setResults([]);
      return;
    }
  };

  const clearInput = () => {
    setInput("");
    if (setResults) setResults([]);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowDropdown(false);

    if (category !== "All Products") {
      navigate(`${categoryRoutes[category]}`);
    }
  };

  const handleSearch = async () => {
    if (!input.trim()) return;

    setIsLoading(true);

    if (selectedCategory === "All Products") {
      // 1. Try Local Search first
      let allProducts = [];
      Object.values(productsData).forEach((categoryProducts) => {
        if (Array.isArray(categoryProducts)) {
          allProducts = allProducts.concat(categoryProducts);
        }
      });

      const found = allProducts.find(
        (p) => p.name && p.name.toLowerCase().includes(input.toLowerCase()),
      );

      if (found) {
        // Product found locally
        const categoryKey = Object.keys(productsData).find((key) => {
          const products = productsData[key];
          return (
            Array.isArray(products) && products.some((p) => p.id === found.id)
          );
        });

        if (categoryKey) {
          const route = categoryRoutes[categoryKey];
          navigate(`${route}?search=${encodeURIComponent(input)}`);
          setIsLoading(false);
          return;
        }
      }

      // 2. If not found locally, try AI Category Inference
      console.log("Product not found locally, asking AI...");
      const aiCategory = await getCategoryFromLLM(input);
      console.log("AI suggested category:", aiCategory);

      if (aiCategory && categoryRoutes[aiCategory]) {
        navigate(
          `${categoryRoutes[aiCategory]}?search=${encodeURIComponent(input)}&ai=true`,
        );
      } else {
        // Fallback if AI fails or returns "None" - go to Home with search param (optional handling)
        // For now, let's just go to All Products search on home or stay put?
        // Let's go to a default search page or handle "No results" gracefully.
        // The user asked: "if products not found then only"
        // If even AI fails, we can just treat it as a failed search.
        // Let's navigate to home or stay and show a "not found" toast?
        // Current behavior for "All Products" search usually goes to a results page.
        // Since we don't have a dedicated "All Results" page, we'll go to Home search.
        // But wait, the previous code didn't actually navigate if nothing was found!
        // It only navigated `if (found)`.
        // So we should maintain that behavior or improve it.
        // Let's notify the user if nothing is found.
        showAlert({
          title: "Product Not Found",
          message: "Product not found. Try a different search term.",
          type: "warning",
        });
      }
    } else {
      // Search within selected category
      const route = categoryRoutes[selectedCategory];
      navigate(`${route}?search=${encodeURIComponent(input)}`);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <div className="category-dropdown">
        <button
          className="category-btn"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {selectedCategory}
          <FaChevronDown
            className={`dropdown-icon ${showDropdown ? "open" : ""}`}
          />
        </button>
        {showDropdown && (
          <div className="dropdown-menu">
            {categories.map((category) => (
              <div
                key={category}
                className={`dropdown-item ${selectedCategory === category ? "active" : ""}`}
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`input-wrapper ${isFocused ? "focused" : ""}`}>
        <FaSearch className="search-icon" />
        <input
          className="search-input"
          placeholder="Search products..."
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {input && <FaTimes className="clear-icon" onClick={clearInput} />}
      </div>

      <button
        className="search-btn"
        onClick={handleSearch}
        disabled={isLoading}
      >
        {isLoading ? "..." : "Search"}
      </button>

      <AlertDialog
        isOpen={alertConfig.isOpen}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
      />
    </div>
  );
};

export default Searchbar;
