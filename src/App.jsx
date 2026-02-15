import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import "./App.css";
import Navbar from "./components/Navbar";
import AIChat from "./components/AIChat";
import Loading from "./components/Loading";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import OrderCancel from "./pages/OrderCancel";
import WalletHistory from "./pages/WalletHistory";
import Electronics from "./pages/Electronics";
import Clothes from "./pages/Clothes";
import Books from "./pages/Books";
import HomeGarden from "./pages/HomeGarden";
import Sports from "./pages/Sports";
import Beauty from "./pages/Beauty";
import Toys from "./pages/Toys";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductDetail from "./pages/ProductDetail";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading message="Loading..." size="large" overlay={true} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Navbar />
            <main className="app-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-success/:orderId"
                  element={
                    <ProtectedRoute>
                      <OrderSuccess />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-cancel/:orderId"
                  element={
                    <ProtectedRoute>
                      <OrderCancel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wallet-history"
                  element={
                    <ProtectedRoute>
                      <WalletHistory />
                    </ProtectedRoute>
                  }
                />
                <Route path="/electronics" element={<Electronics />} />
                <Route path="/clothes" element={<Clothes />} />
                <Route path="/books" element={<Books />} />
                <Route path="/home-garden" element={<HomeGarden />} />
                <Route path="/sports" element={<Sports />} />
                <Route path="/beauty" element={<Beauty />} />
                <Route path="/toys" element={<Toys />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/product/:id" element={<ProductDetail />} />
              </Routes>
            </main>
            <AIChat />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
