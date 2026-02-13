import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaTimes, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getGroqCompletion } from "../services/groqService";
import {
  getAllProducts,
  searchProducts,
  createOrder,
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
      text: "🛍️ Hi! I'm ShopperAI. I can help you find products, manage your cart, place orders, and answer any shopping questions. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Build system prompt with product and user data
  const buildSystemPrompt = () => {
    const allProducts = getAllProducts();
    const productInfo = allProducts
      .map((p) => `- ${p.name}: ₹${p.price} (${p.category}) - ${p.description}`)
      .join("\n");

    let userInfo = "";
    if (user && userData) {
      userInfo = `
Current User Information:
- Name: ${userData.displayName || user.email}
- Email: ${user.email}
- Saved Addresses: ${JSON.stringify(userData.profile || {})}
- Saved Cards: ${userData.paymentMethods?.cards?.length || 0} cards saved
- Saved UPI Addresses: ${userData.paymentMethods?.upiAddresses?.length || 0} UPI addresses saved
`;
    }

    return `You are ShopperAI, a helpful shopping assistant for the Shopper e-commerce platform.

YOU HAVE ACCESS TO:
1. Product Catalog (${allProducts.length} products):
${productInfo.substring(0, 3000)}... (showing first products, more available)

2. User Information:
${userInfo}

YOUR CAPABILITIES:
- Help users find products by name, category, or price range
- Provide product recommendations
- Answer questions about availability and pricing
- Help users place orders (respond with "PLACE_ORDER" when user confirms)
- Access user's saved payment methods and addresses
- Manage shopping cart and orders

IMPORTANT INSTRUCTIONS:
1. RESPOND VERY BRIEFLY AND CONCISELY - Keep answers short and to the point
2. You have full access to all products and can help with cart management
3. When user wants to buy products, ask which ones and confirm
4. When placing order, use "PLACE_ORDER" prefix with order details in JSON format:
   PLACE_ORDER:{"items":[{"id":1,"name":"Product","price":100,"quantity":1}],"totalPrice":100}
5. Always be helpful and professional
6. If user asks to book/order, summarize items and use the order command
7. Provide prices in ₹ (Indian Rupees)`;
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
      // Prepare messages for Groq
      const groqMessages = messages
        .slice(-10) // Last 10 messages for context
        .map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        }))
        .concat([
          {
            role: "user",
            content: userMessage.text,
          },
        ]);

      // Get response from Groq
      const response = await getGroqCompletion(
        groqMessages,
        buildSystemPrompt(),
      );

      // Check if this is an order placement request
      if (response.includes("PLACE_ORDER:")) {
        const orderMatch = response.match(/PLACE_ORDER:({.*?})/);
        if (orderMatch && user) {
          try {
            const orderData = JSON.parse(orderMatch[1]);

            // Get user profile for address and payment method
            const userDocSnap = await getDoc(doc(db, "users", user.uid));
            const userProfile = userDocSnap.data();

            // Create order with user's saved address and payment method
            const createdOrder = await createOrder(user.uid, {
              items: orderData.items,
              totalPrice: orderData.totalPrice,
              shippingAddress: userProfile.profile || orderData.shippingAddress,
              paymentMethod: {
                type:
                  userProfile.paymentMethods?.cards?.length > 0
                    ? "card"
                    : "upi",
                lastDigits:
                  userProfile.paymentMethods?.cards?.[0]?.cardNumber?.slice(
                    -4,
                  ) ||
                  userProfile.paymentMethods?.upiAddresses?.[0]?.upiAddress,
              },
            });

            const botResp = `✅ Order Placed Successfully!\n\n📦 Order Number: ${createdOrder.orderNumber}\n💰 Total Amount: ₹${createdOrder.totalPrice}\n📍 Shipping to: ${
              userProfile.profile?.address || "Saved address"
            }\n\nYour order is being processed and will be delivered soon!`;

            const botMessage = {
              id: messages.length + 2,
              text: botResp,
              sender: "bot",
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
            setLoading(false);
            return;
          } catch (orderError) {
            console.error("Error placing order:", orderError);
          }
        }
      }

      // Regular response (non-order)
      const cleanResponse = response.replace(/PLACE_ORDER:.*?}/g, "").trim();
      const botMessage = {
        id: messages.length + 2,
        text: cleanResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error. Please try again. 😔",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
              placeholder="Ask me about products, orders, payments..."
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
