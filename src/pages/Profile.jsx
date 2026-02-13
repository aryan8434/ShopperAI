import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaMapMarkerAlt,
  FaCreditCard,
  FaPlus,
  FaTimes,
  FaWallet,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import AlertDialog from "../components/AlertDialog";
import Loading from "../components/Loading";
import useAlert from "../hooks/useAlert";
import "../css/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { alertConfig, showAlert, hideAlert, alert, confirm } = useAlert();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("address");
  const [editMode, setEditMode] = useState(false);

  // Form states
  const [addressForm, setAddressForm] = useState({
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

  const [upiForm, setUpiForm] = useState({
    upiAddress: "",
  });

  // Fetch user profile
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setProfileData(userDoc.data());
          setAddressForm(userDoc.data().profile || {});
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleAddressUpdate = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        profile: addressForm,
      });
      setProfileData((prev) => ({
        ...prev,
        profile: addressForm,
      }));
      setEditMode(false);
      alert("Address updated successfully!", "Success", "success");
    } catch (error) {
      console.error("Error updating address:", error);
      alert("Failed to update address", "Error", "error");
    }
  };

  const handleAddCard = async () => {
    if (
      !cardForm.cardNumber ||
      !cardForm.cardHolder ||
      !cardForm.expiryDate ||
      !cardForm.cvv
    ) {
      alert("Please fill all card details", "Warning", "warning");
      return;
    }

    try {
      const updatedCards = [
        ...(profileData.paymentMethods.cards || []),
        {
          id: Date.now(),
          cardNumber: cardForm.cardNumber.slice(-4).padStart(16, "*"),
          cardHolder: cardForm.cardHolder,
          expiryDate: cardForm.expiryDate,
        },
      ];

      await updateDoc(doc(db, "users", user.uid), {
        "paymentMethods.cards": updatedCards,
      });

      setProfileData((prev) => ({
        ...prev,
        paymentMethods: {
          ...prev.paymentMethods,
          cards: updatedCards,
        },
      }));

      setCardForm({ cardNumber: "", cardHolder: "", expiryDate: "", cvv: "" });
      alert("Card added successfully!", "Success", "success");
    } catch (error) {
      console.error("Error adding card:", error);
      alert("Failed to add card", "Error", "error");
    }
  };

  const handleAddUPI = async () => {
    if (!upiForm.upiAddress) {
      alert("Please enter UPI address");
      return;
    }

    try {
      const updatedUPI = [
        ...(profileData.paymentMethods.upiAddresses || []),
        {
          id: Date.now(),
          upiAddress: upiForm.upiAddress,
        },
      ];

      await updateDoc(doc(db, "users", user.uid), {
        "paymentMethods.upiAddresses": updatedUPI,
      });

      setProfileData((prev) => ({
        ...prev,
        paymentMethods: {
          ...prev.paymentMethods,
          upiAddresses: updatedUPI,
        },
      }));

      setUpiForm({ upiAddress: "" });
      alert("UPI address added successfully!", "Success", "success");
    } catch (error) {
      console.error("Error adding UPI:", error);
      alert("Failed to add UPI address", "Error", "error");
    }
  };

  const handleAddWalletMoney = async () => {
    try {
      const currentBalance = profileData.paymentMethods?.wallet || 0;
      const newBalance = currentBalance + 100000;

      await updateDoc(doc(db, "users", user.uid), {
        "paymentMethods.wallet": newBalance,
      });

      setProfileData((prev) => ({
        ...prev,
        paymentMethods: {
          ...prev.paymentMethods,
          wallet: newBalance,
        },
      }));

      alert(
        "₹100,000 added to your wallet successfully!",
        "Success",
        "success",
      );
    } catch (error) {
      console.error("Error adding wallet money:", error);
      alert("Failed to add money to wallet", "Error", "error");
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      const updatedCards = profileData.paymentMethods.cards.filter(
        (card) => card.id !== cardId,
      );
      await updateDoc(doc(db, "users", user.uid), {
        "paymentMethods.cards": updatedCards,
      });

      setProfileData((prev) => ({
        ...prev,
        paymentMethods: {
          ...prev.paymentMethods,
          cards: updatedCards,
        },
      }));
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  const handleDeleteUPI = async (upiId) => {
    try {
      const updatedUPI = profileData.paymentMethods.upiAddresses.filter(
        (upi) => upi.id !== upiId,
      );
      await updateDoc(doc(db, "users", user.uid), {
        "paymentMethods.upiAddresses": updatedUPI,
      });

      setProfileData((prev) => ({
        ...prev,
        paymentMethods: {
          ...prev.paymentMethods,
          upiAddresses: updatedUPI,
        },
      }));
    } catch (error) {
      console.error("Error deleting UPI:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return <Loading message="Loading your profile..." size="large" />;
  }

  if (!profileData) {
    return <div className="profile-error">Unable to load profile</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <FaUser className="profile-avatar" />
          <div className="profile-details">
            <h1>{profileData.displayName || "User"}</h1>
            <p>{profileData.email}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === "address" ? "active" : ""}`}
          onClick={() => setActiveTab("address")}
        >
          <FaMapMarkerAlt /> Address
        </button>
        <button
          className={`tab-btn ${activeTab === "payment" ? "active" : ""}`}
          onClick={() => setActiveTab("payment")}
        >
          <FaCreditCard /> Payment Methods
        </button>
      </div>

      <div className="profile-content">
        {/* Address Tab */}
        {activeTab === "address" && (
          <div className="tab-content">
            <h2>Delivery Address</h2>
            {!editMode ? (
              <div className="address-view">
                <div className="address-info">
                  <p>
                    <strong>Phone:</strong>{" "}
                    {profileData.profile?.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {profileData.profile?.address || "N/A"}
                  </p>
                  <p>
                    <strong>City:</strong> {profileData.profile?.city || "N/A"}
                  </p>
                  <p>
                    <strong>State:</strong>{" "}
                    {profileData.profile?.state || "N/A"}
                  </p>
                  <p>
                    <strong>Zip Code:</strong>{" "}
                    {profileData.profile?.zipCode || "N/A"}
                  </p>
                </div>
                <button className="edit-btn" onClick={() => setEditMode(true)}>
                  Edit Address
                </button>
              </div>
            ) : (
              <div className="address-form">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    placeholder="Enter full address"
                    value={addressForm.address}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        city: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    placeholder="Enter state"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        state: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    placeholder="Enter zip code"
                    value={addressForm.zipCode}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        zipCode: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-actions">
                  <button className="save-btn" onClick={handleAddressUpdate}>
                    Save Address
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === "payment" && (
          <div className="tab-content">
            <h2>Payment Methods</h2>

            {/* Wallet */}
            <div className="payment-section">
              <h3>
                <FaWallet /> Wallet Balance
              </h3>
              <div className="wallet-balance">
                <div className="balance-display">
                  <span className="balance-amount">
                    ₹
                    {(profileData.paymentMethods?.wallet || 0).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                  <span className="balance-label">Available Balance</span>
                </div>
                <button
                  className="add-money-btn"
                  onClick={handleAddWalletMoney}
                >
                  Add ₹100,000
                </button>
              </div>
            </div>

            {/* Credit Cards */}
            <div className="payment-section">
              <h3>Credit/Debit Cards</h3>
              <div className="cards-list">
                {profileData.paymentMethods?.cards?.map((card) => (
                  <div key={card.id} className="card-item">
                    <div className="card-info">
                      <FaCreditCard className="card-icon" />
                      <div>
                        <p className="card-number">{card.cardNumber}</p>
                        <p className="card-holder">{card.cardHolder}</p>
                        <p className="card-expiry">{card.expiryDate}</p>
                      </div>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteCard(card.id)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>

              <div className="add-payment">
                <h4>Add New Card</h4>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={cardForm.cardNumber}
                    onChange={(e) =>
                      setCardForm({
                        ...cardForm,
                        cardNumber: e.target.value,
                      })
                    }
                    maxLength="16"
                  />
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Card Holder Name"
                    value={cardForm.cardHolder}
                    onChange={(e) =>
                      setCardForm({
                        ...cardForm,
                        cardHolder: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardForm.expiryDate}
                      onChange={(e) =>
                        setCardForm({
                          ...cardForm,
                          expiryDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="CVV"
                      value={cardForm.cvv}
                      onChange={(e) =>
                        setCardForm({
                          ...cardForm,
                          cvv: e.target.value,
                        })
                      }
                      maxLength="4"
                    />
                  </div>
                </div>

                <button className="add-btn" onClick={handleAddCard}>
                  <FaPlus /> Add Card
                </button>
              </div>
            </div>

            {/* UPI Addresses */}
            <div className="payment-section">
              <h3>UPI Addresses</h3>
              <div className="upi-list">
                {profileData.paymentMethods?.upiAddresses?.map((upi) => (
                  <div key={upi.id} className="upi-item">
                    <div className="upi-info">
                      <FaWallet className="upi-icon" />
                      <p>{upi.upiAddress}</p>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteUPI(upi.id)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>

              <div className="add-payment">
                <h4>Add New UPI Address</h4>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="username@bankname"
                    value={upiForm.upiAddress}
                    onChange={(e) =>
                      setUpiForm({
                        upiAddress: e.target.value,
                      })
                    }
                  />
                </div>

                <button className="add-btn" onClick={handleAddUPI}>
                  <FaPlus /> Add UPI
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        isOpen={alertConfig.isOpen}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
      />
    </div>
  );
};

export default Profile;
