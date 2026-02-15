import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import "../css/Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      
      // Check database to give specific error as requested
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("User ID does not exist.");
        } else {
          setError("Password is incorrect.");
        }
      } catch (dbError) {
        // Fallback to standard error handling if DB check fails
        if (err.code === "auth/invalid-credential") {
           setError("Incorrect email or password.");
        } else if (err.code === "auth/user-not-found") {
           setError("User ID does not exist.");
        } else if (err.code === "auth/wrong-password") {
           setError("Password is incorrect.");
        } else {
           setError("An error occurred. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          profilePhoto: user.photoURL || "",
          createdAt: new Date(),
          profile: {
            phone: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
          },
          paymentMethods: {
            cards: [],
            upiAddresses: [],
          },
          cart: [],
        });
      }

      navigate("/");
    } catch (err) {
      setError("Google login failed. Please try again.");
      console.error("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Login to your Shopper account</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper-auth">
              <FaEnvelope className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper-auth">
              <FaLock className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          
          {error && <div className="error-message">{error}</div>}
        </form>

        <div className="divider">OR</div>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <FaGoogle />
          Continue with Google
        </button>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="auth-link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
