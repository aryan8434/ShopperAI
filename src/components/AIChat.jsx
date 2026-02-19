import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaTimes, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getGroqCompletion } from "../services/GroqService";
import {
  getAllProducts,
  searchProducts,
  createOrder,
  getCartForLLM,
  placeOrderForLLM,
  addToCartForLLM,
  getOrdersForLLM,
  cancelOrderForLLM,
} from "../services/ShoppingService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../css/AIChat.css";

const AIChat = () => {
  const { user, userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "🛍️ Hi! I'm ShopperAI. I can help you find products, manage your cart, place orders, check history, and answer any shopping questions. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Dynamic Placeholder Logic
  const placeholders = [
      "Ask me to find products...",
      "Type 'Cancel order ORD-123'...",
      "Type 'Place order using wallet'...",
      "Ask 'What is in my cart?'...",
      "Ask 'Show my recent orders'..."
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
      const interval = setInterval(() => {
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
      }, 3000);
      return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Build system prompt with product, user data, AND cart, AND orders
  const buildSystemPrompt = async (currentQuery = "") => {
    const allProducts = getAllProducts();
    
    // --- Context Optimization: Filter Products ---
    let finalProducts = [];
    if (currentQuery) {
        const lowerQuery = currentQuery.toLowerCase();
        finalProducts = allProducts.filter(p => 
            (p.name || "").toLowerCase().includes(lowerQuery) || 
            (p.category || "").toLowerCase().includes(lowerQuery) ||
            (p.description || "").toLowerCase().includes(lowerQuery)
        );
    }

    // Always include top 5 popular products if query results are few or empty
    if (finalProducts.length < 5) {
        const popularProducts = allProducts.slice(0, 5); // Take first 5 as "popular"
        finalProducts = [...new Set([...finalProducts, ...popularProducts])];
    }
    
    // Limit to max 10 products to save tokens
    finalProducts = finalProducts.slice(0, 10);

    const productInfo = finalProducts
      .map((p) => `- ${p.name}: ₹${p.price} (${p.category}) - ${p.description}`)
      .join("\n");
    // ---------------------------------------------

    let cartInfo = "Cart is empty.";
    if (user) {
        const cartItems = await getCartForLLM(user.uid);
        if (cartItems && cartItems.length > 0) {
            cartInfo = cartItems.map(item => `- ${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`).join("\n");
            const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartInfo += `\nTotal Cart Value: ₹${total}`;
        }
    }

    let orderHistory = "No recent orders.";
    if (user) {
        const orders = await getOrdersForLLM(user.uid);
        if (orders && orders.length > 0) {
            orderHistory = orders.map(o => `Order ${o.orderNumber}: ${o.status}, ₹${o.total} (${o.items})`).join("\n");
        }
    }

    let userInfo = "";
    if (user && userData) {
      const walletBalance = userData.paymentMethods?.wallet || 0;
      userInfo = `
Current User Information:
- Name: ${userData.displayName || user.email}
- Email: ${user.email}
- Wallet Balance: ₹${walletBalance}
- Saved Addresses: ${JSON.stringify(userData.profile || {})}
- Saved Cards: ${userData.paymentMethods?.cards?.length || 0} cards saved
- Saved UPI Addresses: ${userData.paymentMethods?.upiAddresses?.length || 0} UPI addresses saved
`;
    }

    return `You are ShopperAI, a helpful shopping assistant for the Shopper e-commerce platform.

YOU HAVE ACCESS TO:
1. Product Catalog (Showing ${finalProducts.length} relevant products):
${productInfo}

2. User Information:
${userInfo}

3. Current Shopping Cart:
${cartInfo}

4. Recent Order History:
${orderHistory}

YOUR CAPABILITIES:
- Help users find products
- ANSWER questions about cart contents and order history
- ADD items to cart: Listen for requests like "add 2 apples".
- PLACE orders: Only if cart is not empty.
- CANCEL orders: Listen for requests like "cancel order ORD-...".

IMPORTANT INSTRUCTIONS:
1. RESPOND VERY BRIEFLY AND CONCISELY.
2. If user wants to ADD items to cart, respond ONLY with:
   ADD_TO_CART:{"name":"product name", "quantity":1}
3. If user wants to PLACE ORDER (and cart is NOT empty), respond ONLY with:
   PLACE_ORDER:{"method":"wallet"} (or card/upi)
4. If user wants to CANCEL ORDER, respond ONLY with:
   CANCEL_ORDER:{"orderNumber":"ORD-..."}
5. If cart is empty and user tries to order, tell them "Your cart is empty, please add items first."
6. Always prices in ₹ (Indian Rupees).`;
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      // Build prompt context DYNAMICALLY
      const systemPrompt = await buildSystemPrompt(inputValue);

      const groqMessages = [
          { role: "system", content: systemPrompt },
          ...messages.slice(-3).map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
          { role: "user", content: userMessage.text }
      ];

      const response = await getGroqCompletion(
        groqMessages, 
        systemPrompt 
      );

      // --- COMMAND HANDLING ---

      // 1. ADD_TO_CART
      if (response.includes("ADD_TO_CART:")) {
          const match = response.match(/ADD_TO_CART:({.*?})/);
          if (match && user) {
             try {
                 const data = JSON.parse(match[1]);
                 const result = await addToCartForLLM(user.uid, data.name, data.quantity || 1);
                 const botResp = `✅ Added ${data.quantity || 1} x ${result.product.name} to your cart.`;
                 setMessages(prev => [...prev, { id: messages.length + 2, text: botResp, sender: "bot", timestamp: new Date() }]);
             } catch (err) {
                 setMessages(prev => [...prev, { id: messages.length + 2, text: "⚠️ " + err.message, sender: "bot", timestamp: new Date() }]);
             }
             setLoading(false);
             return;
          }
      }

      // 2. PLACE_ORDER
      if (response.includes("PLACE_ORDER:")) {
        const orderMatch = response.match(/PLACE_ORDER:({.*?})/);
        if (orderMatch && user) {
          try {
            const commandData = JSON.parse(orderMatch[1]);
            const method = commandData.method || "wallet";

            const createdOrder = await placeOrderForLLM(user.uid, method);

            const botResp = `✅ Order Placed Successfully!\n\n📦 Order Number: ${createdOrder.orderNumber}\n💰 Total Amount: ₹${createdOrder.totalPrice}\n\nYour order has been placed using your ${method}.`;

            setMessages((prev) => [...prev, {
              id: messages.length + 2,
              text: botResp,
              sender: "bot",
              timestamp: new Date(),
            }]);
          } catch (orderError) {
            console.error("Error processing order:", orderError);
            let errorMsg = "⚠️ Failed to place order.";
            if (orderError.message.includes("Cart is empty")) {
                errorMsg = "⚠️ Your cart is empty. Please add items before placing an order.";
            } else {
                errorMsg += " " + (orderError.message || "Check your balance.");
            }
            setMessages((prev) => [...prev, {
              id: messages.length + 2,
              text: errorMsg,
              sender: "bot",
              timestamp: new Date(),
            }]);
          }
          setLoading(false);
          return;
        }
      }

      // 3. CANCEL_ORDER
      if (response.includes("CANCEL_ORDER:")) {
          const match = response.match(/CANCEL_ORDER:({.*?})/);
          if (match && user) {
              try {
                  const data = JSON.parse(match[1]);
                  await cancelOrderForLLM(user.uid, data.orderNumber);
                  const botResp = `✅ Order ${data.orderNumber} has been cancelled. Refund initiated to wallet.`;
                  setMessages(prev => [...prev, { id: messages.length + 2, text: botResp, sender: "bot", timestamp: new Date() }]);
              } catch (err) {
                  setMessages(prev => [...prev, { id: messages.length + 2, text: "⚠️ " + err.message, sender: "bot", timestamp: new Date() }]);
              }
              setLoading(false);
              return;
          }
      }

      // Regular response
      const cleanResponse = response.replace(/(PLACE_ORDER|ADD_TO_CART|CANCEL_ORDER):.*?}/g, "").trim();
      if (cleanResponse) {
        setMessages((prev) => [...prev, {
            id: messages.length + 2,
            text: cleanResponse,
            sender: "bot",
            timestamp: new Date(),
        }]);
      }

    } catch (error) {
      console.error("Error:", error);
      let errorMsg = "Sorry, I encountered an error. Please try again. 😔";

      if (error.message && (error.message.includes("429") || error.message.toLowerCase().includes("rate limit"))) {
          const waitTimeMatch = error.message.match(/try again in (.*?)\./);
          if (waitTimeMatch) {
              errorMsg = `⏳ Usage limit reached. Please try again in ${waitTimeMatch[1]}.`;
          } else {
              errorMsg = "⏳ Usage limit reached. Please try again later.";
          }
      }

      setMessages((prev) => [...prev, {
        id: messages.length + 2,
        text: errorMsg,
        sender: "bot",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className="ai-chat-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with ShopperAI"
      >
        <FaRobot />
        {!isOpen && <span className="ai-chat-notification">Try AI</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-content">
              <FaRobot className="chat-header-icon" />
              <div className="chat-header-text">
                <h3>ShopperAI 🛍️</h3>
                <p className="online-status">● Always Online</p>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">{message.text}</div>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="message-content typing">
                  <span>●</span>
                  <span>●</span>
                  <span>●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder={placeholders[placeholderIndex]}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !loading) handleSendMessage();
              }}
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={loading || inputValue.trim() === ""}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
