import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

/**
 * Add a product to user's cart in Firestore
 * @param {string} userId - The user's UID
 * @param {object} product - Product object with id, name, price, category, image
 * @param {number} quantity - Quantity to add (default: 1)
 * @returns {Promise<object>} - Result object with success/error status
 */
export const addToCart = async (userId, product, quantity = 1) => {
  try {
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    if (!product || !product.id) {
      return { success: false, error: "Invalid product data" };
    }

    // Get user's current cart
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: "User document not found" };
    }

    const currentCart = userDoc.data().cart || [];

    // Check if product already exists in cart
    const existingItem = currentCart.find(
      (item) => item.productId === product.id,
    );

    let updatedCart;

    if (existingItem) {
      // Update quantity if product already in cart
      updatedCart = currentCart.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );
    } else {
      // Add new product to cart
      updatedCart = [
        ...currentCart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.image,
          quantity: quantity,
          addedAt: new Date(),
        },
      ];
    }

    // Update cart in Firestore
    await updateDoc(userRef, {
      cart: updatedCart,
    });

    return {
      success: true,
      message: `${product.name} added to cart!`,
      cartItem: existingItem ? "updated" : "added",
    };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return {
      success: false,
      error: error.message || "Failed to add item to cart",
    };
  }
};

/**
 * Get user's cart items
 * @param {string} userId - The user's UID
 * @returns {Promise<array>} - Array of cart items
 */
export const getCart = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return [];
    }

    return userDoc.data().cart || [];
  } catch (error) {
    console.error("Error getting cart:", error);
    return [];
  }
};

/**
 * Remove item from cart
 * @param {string} userId - The user's UID
 * @param {number} productId - Product ID to remove
 * @returns {Promise<object>} - Result object with success/error status
 */
export const removeFromCart = async (userId, productId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: "User document not found" };
    }

    const currentCart = userDoc.data().cart || [];
    const updatedCart = currentCart.filter(
      (item) => item.productId !== productId,
    );

    await updateDoc(userRef, {
      cart: updatedCart,
    });

    return { success: true, message: "Item removed from cart" };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update quantity of item in cart
 * @param {string} userId - The user's UID
 * @param {number} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Promise<object>} - Result object with success/error status
 */
export const updateCartQuantity = async (userId, productId, quantity) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: "User document not found" };
    }

    const currentCart = userDoc.data().cart || [];

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      return removeFromCart(userId, productId);
    }

    const updatedCart = currentCart.map((item) =>
      item.productId === productId ? { ...item, quantity: quantity } : item,
    );

    await updateDoc(userRef, {
      cart: updatedCart,
    });

    return { success: true, message: "Quantity updated" };
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear entire cart
 * @param {string} userId - The user's UID
 * @returns {Promise<object>} - Result object with success/error status
 */
export const clearCart = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      cart: [],
    });

    return { success: true, message: "Cart cleared" };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, error: error.message };
  }
};
