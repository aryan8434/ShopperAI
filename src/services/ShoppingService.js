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
// Place order for LLM / programmatically
export const placeOrderForLLM = async (userId, paymentMethod = "wallet") => {
  try {
    const cartItems = await getCartForLLM(userId);
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // --- Wallet Logic ---
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error("User not found");

    const userData = userSnap.data();
    let walletBalance = userData.paymentMethods?.wallet || 0;

    if (paymentMethod === "wallet") {
      if (walletBalance < totalPrice) {
        throw new Error(
          `Insufficient wallet balance. Balance: ₹${walletBalance}, Required: ₹${totalPrice}`
        );
      }
      walletBalance -= totalPrice;

      // Deduct from wallet immediately
      await updateDoc(userRef, {
        "paymentMethods.wallet": walletBalance,
        walletTransactions: arrayUnion({
          type: "debit",
          amount: totalPrice,
          description: "Order Placed via AI",
          timestamp: new Date(),
        }),
      });
    }
    // --------------------

    const orderData = {
      items: cartItems,
      totalPrice,
      shippingAddress: {
        address: "Default Address (LLM)",
        city: "N/A",
        state: "N/A",
        zipCode: "000000",
      },
      paymentMethod: { type: paymentMethod },
      paymentStatus: "completed",
    };

    // Create order
    const newOrder = await createOrder(userId, orderData);

    // Clear cart
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

// Add item to cart for LLM
export const addToCartForLLM = async (userId, productName, quantity = 1) => {
  try {
    // 1. Find product
    const allProducts = getAllProducts();
    const product = allProducts.find((p) =>
      p.name.toLowerCase().includes(productName.toLowerCase())
    );

    if (!product) {
      throw new Error(`Product "${productName}" not found.`);
    }

    // 2. Get current cart
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    let currentCart = [];
    if (userSnap.exists()) {
      currentCart = userSnap.data().cart || [];
    }

    // 3. Update cart (logic from CartContext)
    const existingItemIndex = currentCart.findIndex(
      (item) => item.productId === product.id
    );

    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity += quantity;
    } else {
      currentCart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
      });
    }

    // 4. Save to Firestore
    await updateDoc(userRef, { cart: currentCart });
    return { success: true, product, cart: currentCart };
  } catch (error) {
    console.error("Error adding to cart via LLM:", error);
    throw error;
  }
};

// Get recent orders for LLM context
export const getOrdersForLLM = async (userId) => {
  try {
    const orders = await getUserOrders(userId);
    // Return simplified list of last 5 orders
    return orders.slice(0, 5).map((o) => ({
      orderNumber: o.orderNumber || o.id,
      date: o.createdAt?.toDate?.()?.toLocaleDateString() || "N/A",
      total: o.totalPrice,
      status: o.status,
      items: o.items.map((i) => `${i.name} (x${i.quantity})`).join(", "),
    }));
  } catch (error) {
    console.error("Error getting orders for LLM:", error);
    return [];
  }
};

// Cancel order for LLM
export const cancelOrderForLLM = async (userId, orderNumber) => {
  try {
    // Need to find order ID by orderNumber (if they differ) or just iterate
    const orders = await getUserOrders(userId);
    const order = orders.find(
      (o) =>
        (o.orderNumber && o.orderNumber === orderNumber) || o.id === orderNumber
    );

    if (!order) {
      throw new Error(`Order ${orderNumber} not found.`);
    }

    if (order.status === "cancelled") {
      throw new Error(`Order ${orderNumber} is already cancelled.`);
    }

    if (order.status === "delivered") {
      throw new Error(
        `Order ${orderNumber} is already delivered and cannot be cancelled.`
      );
    }

    // --- Refund Logic ---
    if (order.paymentStatus === "completed") {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const currentBalance = userSnap.data().paymentMethods?.wallet || 0;
      
      await updateDoc(userRef, {
        "paymentMethods.wallet": currentBalance + order.totalPrice,
        walletTransactions: arrayUnion({
          type: "credit",
          amount: order.totalPrice,
          description: `Refund for Order ${order.orderNumber}`,
          timestamp: new Date(),
          orderId: order.id,
        }),
      });
    }
    // --------------------

    await cancelOrder(userId, order.id);
    return { success: true, orderNumber };
  } catch (error) {
    console.error("Error cancelling order via LLM:", error);
    throw error;
  }
};
