import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
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
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      orderNumber: `ORD-${Date.now()}`,
    };

    const docRef = await addDoc(collection(db, "orders"), order);
    return { id: docRef.id, ...order };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Get user orders
export const getUserOrders = async (userId) => {
  try {
    const q = query(collection(db, "orders"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
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

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    await updateDoc(doc(db, "orders", orderId), {
      status,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating order:", error);
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
