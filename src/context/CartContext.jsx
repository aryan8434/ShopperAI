import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        if (userData && userData.cart) {
          setCartItems(userData.cart);
        } else {
          setCartItems([]);
        }
      } else {
        const localCart = localStorage.getItem("cart");
        if (localCart) {
          setCartItems(JSON.parse(localCart));
        }
      }
    };
    loadCart();
  }, [user, userData]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const updateFirestore = async (newCart) => {
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          cart: newCart,
        });
      } catch (error) {
        console.error("Error updating cart in Firestore:", error);
      }
    }
  };

  const addToCart = async (product) => {
    let newCart = [...cartItems];
    const existingItemIndex = newCart.findIndex(
      (item) => item.productId === product.productId
    );

    if (existingItemIndex > -1) {
      newCart[existingItemIndex].quantity += 1;
    } else {
      newCart.push({ ...product, quantity: 1 });
    }

    setCartItems(newCart);
    updateFirestore(newCart);
  };

  const removeItemFromCart = async (productId) => {
    const newCart = cartItems.filter((item) => item.productId !== productId);
    setCartItems(newCart);
    updateFirestore(newCart);
  };

  const updateItemQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItemFromCart(productId);
      return;
    }

    const newCart = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(newCart);
    updateFirestore(newCart);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };
  
  const clearCart = async () => {
      setCartItems([]);
      updateFirestore([]);
  }

  const value = {
    cartItems,
    addToCart,
    removeItemFromCart,
    updateItemQuantity,
    getCartTotal,
    clearCart,
    loading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
