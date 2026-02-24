import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaMinus, FaStar, FaRegStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import {
  addToCart, getCart, updateCartQuantity,
} from "../services/CartService";
import {
  collection, addDoc, getDocs, query, orderBy,
  doc, getDoc as fsGetDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import productsData from "../data/productsData";
import Loading from "../components/Loading";
import { toast } from "../components/Toast";
import "../css/ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // Find product by ID from all categories
    let foundProduct = null;
    Object.values(productsData).forEach((categoryProducts) => {
      if (Array.isArray(categoryProducts)) {
        const prod = categoryProducts.find((p) => p.id === parseInt(id));
        if (prod) foundProduct = prod;
      }
    });

    if (foundProduct) {
      setProduct(foundProduct);
      // Track recently viewed
      const key = "shopper_recent";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      const filtered = prev.filter(p => p.id !== foundProduct.id);
      const next = [{ id: foundProduct.id, name: foundProduct.name, image: foundProduct.image, price: foundProduct.price, category: foundProduct.category }, ...filtered].slice(0, 10);
      localStorage.setItem(key, JSON.stringify(next));
      if (user) checkProductInCart();
      // Load reviews
      loadReviews(parseInt(id));
      if (user) checkCanReview(parseInt(id));
    } else {
      navigate("/products");
    }
  }, [id, user, navigate]);

  const checkProductInCart = async () => {
    try {
      const cartItems = await getCart(user.uid);
      const cartItem = cartItems.find(
        (item) => item.productId === parseInt(id),
      );
      setQuantity(cartItem ? cartItem.quantity : 0);
    } catch (error) {
      console.error("Error checking cart:", error);
      setQuantity(0);
    }
  };

  const showNotification = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleWishlist = async () => {
    if (!user) { navigate("/login"); return; }
    if (isWishlisted(product.id)) {
      await removeFromWishlist(product.id);
      toast.info("Removed from wishlist");
    } else {
      await addToWishlist(product);
      toast.success("Saved to wishlist ❤️");
    }
  };

  // ── Reviews ─────────────────────────────────────────────────────
  const loadReviews = async (productId) => {
    try {
      const q = query(collection(db, "reviews", String(productId), "list"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReviews(list);
      if (list.length > 0) {
        const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
        setAvgRating(Math.round(avg * 10) / 10);
      }
    } catch { /* silent */ }
  };

  const checkCanReview = async (productId) => {
    try {
      const ordersSnap = await getDocs(collection(db, "users", user.uid, "orders"));
      const hasDelivered = ordersSnap.docs.some(d => {
        const o = d.data();
        return (o.status === "delivered" || o.status === "completed") &&
          (o.items || []).some(item => item.id === productId || item.productId === productId);
      });
      setCanReview(hasDelivered);
    } catch { setCanReview(false); }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.text.trim()) { toast.error("Please write a review."); return; }
    setSubmittingReview(true);
    try {
      const userSnap = await fsGetDoc(doc(db, "users", user.uid));
      const displayName = user.displayName || userSnap.data()?.name || "User";
      await addDoc(collection(db, "reviews", String(product.id), "list"), {
        uid: user.uid, name: displayName,
        rating: reviewForm.rating, text: reviewForm.text.trim(),
        date: new Date(),
      });
      toast.success("Review submitted! Thank you.");
      setReviewForm({ rating: 5, text: "" });
      setCanReview(false); // one review per purchase
      loadReviews(product.id);
    } catch { toast.error("Failed to submit review."); }
    finally { setSubmittingReview(false); }
  };

  const handleAddToCart = async () => {
    if (!user) {
      showNotification("Please login to add items to cart");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const result = await addToCart(user.uid, product, 1);
      if (result.success) {
        setQuantity(1);
        showNotification(`✓ ${product.name} added to cart!`);
      } else {
        showNotification(`Error: ${result.error}`);
      }
    } catch (error) {
      showNotification("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleIncreaseQuantity = async () => {
    const newQuantity = quantity + 1;
    setLoading(true);
    try {
      const result = await updateCartQuantity(
        user.uid,
        product.id,
        newQuantity,
      );
      if (result.success) {
        setQuantity(newQuantity);
        showNotification(`✓ Quantity updated!`);
      } else {
        showNotification(`Error: ${result.error}`);
      }
    } catch (error) {
      showNotification("Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  const handleDecreaseQuantity = async () => {
    const newQuantity = quantity - 1;
    setLoading(true);
    try {
      if (newQuantity === 0) {
        // Remove from cart if quantity becomes 0
        const result = await updateCartQuantity(user.uid, product.id, 0);
        if (result.success) {
          setQuantity(0);
          showNotification("✓ Removed from cart!");
        } else {
          showNotification(`Error: ${result.error}`);
        }
      } else {
        const result = await updateCartQuantity(
          user.uid,
          product.id,
          newQuantity,
        );
        if (result.success) {
          setQuantity(newQuantity);
          showNotification(`✓ Quantity updated!`);
        } else {
          showNotification(`Error: ${result.error}`);
        }
      }
    } catch (error) {
      showNotification("Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="product-detail-container">
        <Loading message="Loading product..." size="large" />
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      {message && <div className="notification">{message}</div>}

      {/* Sticky back button */}
      <button onClick={() => navigate(-1)} className="pd-back-sticky">
        <FaArrowLeft /> Back
      </button>

      <div className="product-detail-content">
        <div className="product-image-section">
          {/* Heart wishlist overlay */}
          <button
            className={`pd-heart-btn ${product && isWishlisted(product.id) ? "pd-heart-active" : ""}`}
            onClick={handleWishlist}
            title={product && isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
          >
            {product && isWishlisted(product.id) ? <FaHeart /> : <FaRegHeart />}
          </button>
          <img
            src={product.image}
            alt={product.name}
            className="product-detail-image"
          />
        </div>

        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-category-detail">{product.category}</p>

          <div className="product-price-section">
            <span className="product-price-detail">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="product-description-section">
            <h3>Description</h3>
            <p className="product-description-detail">
              {product.description ||
                `Discover the ${product.name} - a premium ${product.category.toLowerCase()} item designed for quality and comfort. This product offers excellent value and is perfect for your needs.`}
            </p>
          </div>

          <div className="product-actions">
            {quantity === 0 ? (
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={loading}
              >
                {user
                  ? loading
                    ? "Adding..."
                    : "Add to Cart"
                  : "Login to Buy"}
              </button>
            ) : (
              <div className="quantity-controls-detail">
                <button
                  className="qty-btn minus"
                  onClick={handleDecreaseQuantity}
                  disabled={loading}
                  title="Remove from cart"
                >
                  <FaMinus />
                </button>
                <span className="qty-display">{quantity}</span>
                <button
                  className="qty-btn plus"
                  onClick={handleIncreaseQuantity}
                  disabled={loading}
                  title="Add more"
                >
                  <FaPlus />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Reviews ─────────────────────────────────────── */}
      <div className="pd-reviews-section">
        <div className="pd-reviews-header">
          <h2>Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="pd-avg-rating">
              <span className="pd-stars">
                {[1,2,3,4,5].map(s => (
                  <FaStar key={s} style={{ color: s <= Math.round(avgRating) ? "#f59e0b" : "#e0e0e0", fontSize: "1.1rem" }} />
                ))}
              </span>
              <span className="pd-avg-num">{avgRating}</span>
              <span className="pd-review-count">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
            </div>
          )}
        </div>

        {/* Write a review */}
        {canReview && (
          <div className="pd-review-form">
            <h3>Write a Review <span className="pd-verified-badge">✓ Verified Purchase</span></h3>
            <div className="pd-star-picker">
              {[1,2,3,4,5].map(s => (
                <button key={s} className="pd-star-btn" onClick={() => setReviewForm(p => ({ ...p, rating: s }))}>
                  {s <= reviewForm.rating ? <FaStar style={{ color: "#f59e0b" }} /> : <FaRegStar style={{ color: "#ccc" }} />}
                </button>
              ))}
              <span className="pd-rating-label">{["Terrible","Poor","Okay","Good","Excellent"][reviewForm.rating - 1]}</span>
            </div>
            <textarea
              className="pd-review-textarea"
              placeholder="Share your experience with this product…"
              value={reviewForm.text}
              onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))}
              rows={3}
            />
            <button className="pd-submit-review-btn" onClick={handleSubmitReview} disabled={submittingReview}>
              {submittingReview ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className="pd-no-reviews">No reviews yet. Be the first to review!</div>
        ) : (
          <div className="pd-review-list">
            {reviews.map(r => (
              <div key={r.id} className="pd-review-card">
                <div className="pd-review-top">
                  <div className="pd-reviewer-name">{r.name}</div>
                  <div className="pd-review-stars">
                    {[1,2,3,4,5].map(s => (
                      <FaStar key={s} style={{ color: s <= r.rating ? "#f59e0b" : "#e0e0e0", fontSize: "0.85rem" }} />
                    ))}
                  </div>
                  <div className="pd-review-date">
                    {r.date?.toDate ? r.date.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </div>
                </div>
                <p className="pd-review-text">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
