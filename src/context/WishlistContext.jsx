import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    if (!user) { setWishlistItems([]); return; }
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setWishlistItems(snap.data().wishlist || []);
    });
    return unsub;
  }, [user]);

  const isWishlisted = (productId) =>
    wishlistItems.some(p => p.id === productId);

  const addToWishlist = async (product) => {
    if (!user || isWishlisted(product.id)) return;
    const item = { id: product.id, name: product.name, price: product.price, image: product.image, category: product.category };
    const next = [...wishlistItems, item];
    setWishlistItems(next);   // optimistic
    await updateDoc(doc(db, "users", user.uid), { wishlist: next });
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;
    const next = wishlistItems.filter(p => p.id !== productId);
    setWishlistItems(next);   // optimistic
    await updateDoc(doc(db, "users", user.uid), { wishlist: next });
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, isWishlisted, addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
