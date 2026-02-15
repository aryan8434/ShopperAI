import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import "../css/Auth.css";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-credential":
        return "Incorrect email or password.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/email-already-in-use":
        return "This email already exists.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, displayName);
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      setError(getFriendlyErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      setError("Google signup failed. Please try again.");
      console.error("Google signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Get Started</h1>
          <p>Create your Shopper account</p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label htmlFor="displayName">Full Name</label>
            <div className="input-wrapper-auth">
              <FaUser className="input-icon" />
              <input
                id="displayName"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper-auth">
              <FaLock className="input-icon" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
          
          {error && <div className="error-message">{error}</div>}
        </form>

        <div className="divider">OR</div>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          <FaGoogle />
          Sign up with Google
        </button>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
