import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";
import productsData from "../data/productsData";

// Get all products
export const getAllProducts = () => {
  const allProducts = [];
  Object.values(productsData).forEach((categoryProducts) => {
    allProducts.push(...categoryProducts);
  });
  return allProducts;
};

// Get products by category
export const getProductsByCategory = (category) => {
  return productsData[category] || [];
};

// Get product by ID
export const getProductById = (productId) => {
  const allProducts = getAllProducts();
  return allProducts.find((p) => p.id === productId);
};

// Search products
export const searchProducts = (query) => {
  const allProducts = getAllProducts();
  const lowerQuery = query.toLowerCase();
  return allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery),
  );
};

// Create order
export const createOrder = async (userId, orderData) => {
  try {
    const order = {
      userId,
      items: orderData.items || [],
      totalPrice: orderData.totalPrice || 0,
      shippingAddress: orderData.shippingAddress || {},
      paymentMethod: orderData.paymentMethod || {},
      status: "processing",
      paymentStatus: orderData.paymentStatus || "completed",
      createdAt: new Date(),
      updatedAt: new Date(),
      orderNumber: `ORD-${Date.now()}`,
      estimatedDelivery: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 3 days from now
    };

    // Add to users/{userId}/orders
    const docRef = await addDoc(collection(db, "users", userId, "orders"), order);
    return { id: docRef.id, ...order };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Get user orders from subcollection
export const getUserOrders = async (userId) => {
  try {
    const ordersRef = collection(db, "users", userId, "orders");
    const querySnapshot = await getDocs(ordersRef);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Get order by ID (Requires userId for subcollection)
export const getOrderById = async (userId, orderId) => {
  try {
    const orderRef = doc(db, "users", userId, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      return { id: orderSnap.id, ...orderSnap.data() };
    } else {
      throw new Error("Order not found");
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

export const updateOrderStatus = async (userId, orderId, status) => {
  try {
    await updateDoc(doc(db, "users", userId, "orders", orderId), {
      status,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

// --- LLM Helper Functions ---

// Get cart for LLM / specific user
export const getCartForLLM = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
       return userSnap.data().cart || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching cart for LLM:", error);
    return [];
  }
};

// Place order for LLM / programmatically
export const placeOrderForLLM = async (userId, paymentMethod = "wallet") => {
    try {
        const cartItems = await getCartForLLM(userId);
        if (!cartItems || cartItems.length === 0) {
            throw new Error("Cart is empty");
        }

        const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const orderData = {
            items: cartItems,
            totalPrice,
            shippingAddress: { address: "Default Address (LLM)", city: "N/A", state: "N/A", zipCode: "000000" }, 
            paymentMethod: { type: paymentMethod },
            paymentStatus: "completed"
        };
        
        // Create order
        const newOrder = await createOrder(userId, orderData);

        // Clear cart
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { cart: [] });

        return newOrder;
    } catch (error) {
        console.error("Error placing order via LLM:", error);
        throw error;
    }
};

// Cancel order
export const cancelOrder = async (userId, orderId, refundMethod) => {
  try {
    // orders are now in users/{userId}/orders
    const orderRef = doc(db, "users", userId, "orders", orderId);
    await updateDoc(orderRef, {
      status: "cancelled",
      refundMethod: refundMethod || "original", // Store refund method if provided
      cancelledAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};

// Retry order payment
export const retryOrderPayment = async (userId, orderId) => {
  try {
    // Get the order from subcollection
    const orderRef = doc(db, "users", userId, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      throw new Error("Order not found");
    }

    const order = { id: orderSnap.id, ...orderSnap.data() };

    // Check if payment is failed
    if (order.paymentStatus !== "failed") {
      throw new Error("Payment retry not available for this order");
    }

    // Get user data
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const userData = userSnap.data();
    const walletBalance = userData.paymentMethods?.wallet || 0;

    // Check if sufficient balance
    if (walletBalance < order.totalPrice) {
      return { success: false, error: "Insufficient wallet balance" };
    }

    // Calculate new balance
    const newBalance = walletBalance - order.totalPrice;

    // Create transaction record
    const transaction = {
      type: "debit",
      amount: order.totalPrice,
      description: `Payment for Order ${order.orderNumber}`,
      timestamp: new Date(),
      orderId: orderId,
    };

    // Update order status
    await updateDoc(orderRef, {
      paymentStatus: "completed",
      paymentMethod: "wallet",
      updatedAt: new Date(),
    });

    // Update user wallet
    await updateDoc(userRef, {
      "paymentMethods.wallet": newBalance,
      "walletTransactions": arrayUnion(transaction), // Note: Check if walletTransactions is field
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error("Error retrying payment:", error);
    throw error;
  }
};

// Get user cart
export const getUserCart = async (userId) => {
  try {
    const userDoc = await getDocs(
      query(collection(db, "users"), where("uid", "==", userId)),
    );
    if (!userDoc.empty) {
      return userDoc.docs[0].data().cart || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
};
