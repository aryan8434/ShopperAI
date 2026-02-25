<div align="center">

# 🛍️ ShopperAI

**A modern, AI-powered e-commerce platform built with React 19 & Firebase**

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20App-6366f1?style=for-the-badge)](https://shopper-ai-lake.vercel.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

<br />

> 🤖 **Shop smarter** — browse products, manage your cart, place & cancel orders, all through a natural conversation with an AI assistant powered by **LLaMA 3.3 70B**.

<br />

**[🚀 Try it Live](https://shopper-ai-lake.vercel.app/)**

</div>

---

## ✨ Features

### 🤖 AI Shopping Assistant (ShopperAI Chat)
- Powered by **Groq API + LLaMA 3.3 70B** — the fastest inference on the planet
- Understands natural language commands to **add items to cart**, **place orders**, and **cancel orders**
- Context-aware: knows your cart contents, order history, wallet balance, and saved addresses in real-time
- Floating chat button with pulsing animation and dynamic rotating placeholder hints
- Runs entirely in-browser — no backend required

### 🔐 Authentication & User Management
- Secure **Firebase Authentication** (Email/Password)
- Protected routes — sensitive pages redirect unauthenticated users to `/login`
- User profile stored in **Cloud Firestore** with real-time sync

### 🛒 Full E-Commerce Flow
| Feature | Description |
|---|---|
| **Product Catalog** | 7 categories: Electronics, Clothes, Books, Home & Garden, Sports, Beauty, Toys |
| **Product Detail** | Image zoom, description, ratings, add to cart, wishlist toggle |
| **Smart Search** | AI-categorized search — queries are classified by the LLM into the right category |
| **Cart** | Persistent cart stored in Firestore, quantity controls, real-time totals |
| **Wishlist** | Save products for later, backed by Firestore via React Context |
| **Recently Viewed** | Tracked via localStorage, viewable in Profile |
| **Checkout** | Multi-step: address → payment → confirmation |
| **Order Management** | Place, track, and cancel orders with status badges (Processing / Completed / Cancelled) |
| **Wallet** | In-app wallet with balance display, top-up, and full transaction history |

### 👤 User Profile
- **Multiple delivery addresses** — add, edit, delete, set default (Home / Work / Other)
- **Payment methods** — save Credit/Debit cards and UPI addresses
- **Wallet** — view balance, top-up funds, and browse transaction history
- **Wishlist & Recently Viewed** tabs within the profile

### 🎨 UI & UX
- Fully responsive design with a clean, modern aesthetic
- Custom CSS animations — pulsing AI button, typing indicator, smooth page transitions
- Toast notification system for real-time feedback
- Custom `AlertDialog` component for confirmations (no browser `window.confirm`)
- Loading states with overlay spinner
- Vercel SPA routing configured via `vercel.json`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS 4 + Vanilla CSS |
| **Routing** | React Router DOM v7 |
| **Authentication** | Firebase Auth |
| **Database** | Firebase Firestore |
| **AI / LLM** | Groq SDK + LLaMA 3.3 70B Versatile |
| **Icons** | React Icons v5 |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components (Navbar, AIChat, Toast, Loading, AlertDialog)
├── context/          # React Contexts (AuthContext, CartContext, WishlistContext)
├── css/              # Component-level CSS files
├── data/             # Static product catalog data
├── hooks/            # Custom hooks (useAlert)
├── pages/            # Page-level components (Home, Cart, Checkout, Orders, Profile, ...)
├── services/         # API abstractions (GroqService, ShoppingService, ...)
└── firebase.js       # Firebase initialization
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- A [Firebase project](https://console.firebase.google.com/) with Firestore & Auth enabled
- A [Groq API key](https://console.groq.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/aryan8434/ShopperAI.git
cd ShopperAI

# 2. Install dependencies
npm install

# 3. Create a .env file in the project root
cp .env.example .env
```

### Environment Variables

Create a `.env` file with the following keys:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GROQ_API_KEY=your_groq_api_key
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 💡 AI Chat — How It Works

The `ShopperAI` assistant is a fully agentic chatbot that parses **structured commands** from LLM responses:

| Natural Language | Parsed Command |
|---|---|
| *"Add 2 Sony headphones to cart"* | `ADD_TO_CART:{"name":"Sony Headphones","quantity":2}` |
| *"Place my order using wallet"* | `PLACE_ORDER:{"method":"wallet"}` |
| *"Cancel order ORD-12345"* | `CANCEL_ORDER:{"orderNumber":"ORD-12345"}` |

The LLM receives a context-rich system prompt on every message containing:
- Relevant products from the catalog (filtered by query + top 5 popular)
- Live cart contents with totals
- Recent order history
- User wallet balance, saved addresses, and payment methods

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ by **Aryan** · [Live Demo](https://shopper-ai-lake.vercel.app/)

</div>
