import { db } from "../firebase";
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";

/**
 * Create and save an order from cart items
 * @param {string} userId - The user's UID
 * @param {array} cartItems - Array of items in cart
 * @returns {Promise<object>} - Order details including orderId
 */
export const createOrder = async (userId, cartItems) => {
  try {
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "Cart is empty" };
    }

    // Generate unique Order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    // Create order object
    const order = {
      orderId: orderId,
      userId: userId,
      items: cartItems,
      totalAmount: totalAmount,
      paymentStatus: "completed",
      paymentMethod: "dummy_payment",
      orderDate: new Date().toISOString(),
      deliveryStatus: "processing",
      estimatedDelivery: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 3 days from now
    };

    // Update user's orders array in Firestore
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      orders: arrayUnion(order),
      cart: [], // Clear cart after order
    });

    return {
      success: true,
      orderId: orderId,
      totalAmount: totalAmount,
      message: "Order placed successfully!",
      order: order,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: error.message || "Failed to create order",
    };
  }
};

/**
 * Get all orders for a user
 * @param {string} userId - The user's UID
 * @returns {Promise<array>} - Array of user's orders
 */
export const getUserOrders = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return [];
    }

    return userDoc.data().orders || [];
  } catch (error) {
    console.error("Error getting user orders:", error);
    return [];
  }
};

/**
 * Get specific order details
 * @param {string} userId - The user's UID
 * @param {string} orderId - The order ID
 * @returns {Promise<object>} - Order details
 */
export const getOrderDetails = async (userId, orderId) => {
  try {
    const orders = await getUserOrders(userId);
    const order = orders.find((o) => o.orderId === orderId);

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, order: order };
  } catch (error) {
    console.error("Error getting order details:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancel an order
 * @param {string} userId - The user's UID
 * @param {string} orderId - The order ID
 * @returns {Promise<object>} - Result of cancellation
 */
export const cancelOrder = async (userId, orderId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: "User not found" };
    }

    const orders = userDoc.data().orders || [];
    const updatedOrders = orders.map((order) => {
      if (order.orderId === orderId && order.deliveryStatus !== "delivered") {
        return { ...order, deliveryStatus: "cancelled" };
      }
      return order;
    });

    await updateDoc(userRef, {
      orders: updatedOrders,
    });

    return { success: true, message: "Order cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { success: false, error: error.message };
  }
};
