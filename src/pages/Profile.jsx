import React, { useState, useEffect } from "react";
import {
  FaUser, FaMapMarkerAlt, FaCreditCard, FaPlus, FaTimes,
  FaWallet, FaStar, FaEdit, FaTrash, FaHeart, FaHistory,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useWishlist } from "../context/WishlistContext";
import AlertDialog from "../components/AlertDialog";
import Loading from "../components/Loading";
import useAlert from "../hooks/useAlert";
import "../css/Profile.css";

const emptyAddress = { phone: "", address: "", city: "", state: "", zipCode: "", label: "Home" };

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { alertConfig, showAlert, hideAlert, alert, confirm } = useAlert();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("address");
  const [recentItems, setRecentItems] = useState([]);

  // Address state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(emptyAddress);

  // Payment state
  const [cardForm, setCardForm] = useState({ cardNumber: "", cardHolder: "", expiryDate: "", cvv: "" });
  const [upiForm, setUpiForm] = useState({ upiAddress: "" });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          // Migrate old single `profile` field → addresses array
          if (!data.addresses && data.profile) {
            const migrated = [{ id: Date.now(), isDefault: true, label: "Home", ...data.profile }];
            await updateDoc(doc(db, "users", user.uid), { addresses: migrated });
            data.addresses = migrated;
          }
          setProfileData(data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, navigate]);

  // Load recently viewed on mount
  useEffect(() => {
    try { setRecentItems(JSON.parse(localStorage.getItem("shopper_recent") || "[]")); }
    catch { setRecentItems([]); }
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────
  const getAddresses = () => profileData?.addresses || [];

  const saveAddresses = async (updated) => {
    await updateDoc(doc(db, "users", user.uid), { addresses: updated });
    setProfileData(prev => ({ ...prev, addresses: updated }));
  };

  // ── Address handlers ────────────────────────────────────────────
  const openNewAddress = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
    setShowAddressForm(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({ phone: addr.phone || "", address: addr.address || "", city: addr.city || "", state: addr.state || "", zipCode: addr.zipCode || "", label: addr.label || "Home" });
    setShowAddressForm(true);
  };

  const handleSaveAddress = async () => {
    if (!addressForm.address || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      alert("Please fill address, city, state and zip code.", "Warning", "warning");
      return;
    }
    const addresses = getAddresses();
    try {
      if (editingAddressId) {
        const updated = addresses.map(a => a.id === editingAddressId ? { ...a, ...addressForm } : a);
        await saveAddresses(updated);
        alert("Address updated!", "Success", "success");
      } else {
        const newAddr = { id: Date.now(), isDefault: addresses.length === 0, ...addressForm };
        await saveAddresses([...addresses, newAddr]);
        alert("Address added!", "Success", "success");
      }
      setShowAddressForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save address.", "Error", "error");
    }
  };

  const handleDeleteAddress = async (id) => {
    const ok = await confirm({ title: "Delete Address", message: "Remove this address?", confirmText: "Delete", cancelText: "Cancel" });
    if (!ok) return;
    const updated = getAddresses().filter(a => a.id !== id);
    // If we deleted the default, make first one default
    if (updated.length > 0 && !updated.find(a => a.isDefault)) updated[0].isDefault = true;
    await saveAddresses(updated);
  };

  const handleSetDefault = async (id) => {
    const updated = getAddresses().map(a => ({ ...a, isDefault: a.id === id }));
    await saveAddresses(updated);
    alert("Default address updated!", "Success", "success");
  };

  // ── Card handlers ───────────────────────────────────────────────
  const handleAddCard = async () => {
    if (!cardForm.cardNumber || !cardForm.cardHolder || !cardForm.expiryDate || !cardForm.cvv) {
      alert("Please fill all card details.", "Warning", "warning"); return;
    }
    try {
      const updatedCards = [...(profileData.paymentMethods?.cards || []), {
        id: Date.now(),
        cardNumber: cardForm.cardNumber.slice(-4).padStart(16, "*"),
        cardHolder: cardForm.cardHolder,
        expiryDate: cardForm.expiryDate,
      }];
      await updateDoc(doc(db, "users", user.uid), { "paymentMethods.cards": updatedCards });
      setProfileData(prev => ({ ...prev, paymentMethods: { ...prev.paymentMethods, cards: updatedCards } }));
      setCardForm({ cardNumber: "", cardHolder: "", expiryDate: "", cvv: "" });
      alert("Card added!", "Success", "success");
    } catch { alert("Failed to add card.", "Error", "error"); }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      const updatedCards = profileData.paymentMethods.cards.filter(c => c.id !== cardId);
      await updateDoc(doc(db, "users", user.uid), { "paymentMethods.cards": updatedCards });
      setProfileData(prev => ({ ...prev, paymentMethods: { ...prev.paymentMethods, cards: updatedCards } }));
    } catch { alert("Failed to delete card.", "Error", "error"); }
  };

  // ── UPI handlers ────────────────────────────────────────────────
  const handleAddUPI = async () => {
    if (!upiForm.upiAddress) { alert("Please enter a UPI address.", "Warning", "warning"); return; }
    try {
      const updatedUPI = [...(profileData.paymentMethods?.upiAddresses || []), { id: Date.now(), upiAddress: upiForm.upiAddress }];
      await updateDoc(doc(db, "users", user.uid), { "paymentMethods.upiAddresses": updatedUPI });
      setProfileData(prev => ({ ...prev, paymentMethods: { ...prev.paymentMethods, upiAddresses: updatedUPI } }));
      setUpiForm({ upiAddress: "" });
      alert("UPI added!", "Success", "success");
    } catch { alert("Failed to add UPI.", "Error", "error"); }
  };

  const handleDeleteUPI = async (upiId) => {
    try {
      const updatedUPI = profileData.paymentMethods.upiAddresses.filter(u => u.id !== upiId);
      await updateDoc(doc(db, "users", user.uid), { "paymentMethods.upiAddresses": updatedUPI });
      setProfileData(prev => ({ ...prev, paymentMethods: { ...prev.paymentMethods, upiAddresses: updatedUPI } }));
    } catch { alert("Failed to delete UPI.", "Error", "error"); }
  };

  // ── Wallet ──────────────────────────────────────────────────────
  const handleAddWalletMoney = async () => {
    try {
      const currentBalance = profileData.paymentMethods?.wallet || 0;
      const newBalance = currentBalance + 100000;
      const transaction = { id: Date.now(), type: "credit", amount: 100000, description: "Added to wallet", timestamp: new Date() };
      await updateDoc(doc(db, "users", user.uid), {
        "paymentMethods.wallet": newBalance,
        walletTransactions: [transaction, ...(profileData.walletTransactions || [])],
      });
      setProfileData(prev => ({
        ...prev,
        paymentMethods: { ...prev.paymentMethods, wallet: newBalance },
        walletTransactions: [transaction, ...(prev.walletTransactions || [])],
      }));
      alert("₹1,00,000 added to your wallet!", "Success", "success");
    } catch { alert("Failed to add money.", "Error", "error"); }
  };

  const handleLogout = async () => {
    try { await logout(); navigate("/login"); }
    catch (err) { console.error(err); }
  };

  if (loading) return <Loading message="Loading your profile..." size="large" />;
  if (!profileData) return <div className="profile-error">Unable to load profile</div>;

  const addresses = getAddresses();

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
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === "address" ? "active" : ""}`} onClick={() => setActiveTab("address")}>
          <FaMapMarkerAlt /> Addresses
        </button>
        <button className={`tab-btn ${activeTab === "payment" ? "active" : ""}`} onClick={() => setActiveTab("payment")}>
          <FaCreditCard /> Payment Methods
        </button>
      </div>

      <div className="profile-content">

        {/* ── Addresses Tab ── */}
        {activeTab === "address" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Delivery Addresses</h2>
              <button className="add-addr-btn" onClick={openNewAddress}><FaPlus /> Add New</button>
            </div>

            {addresses.length === 0 && !showAddressForm && (
              <div className="no-items-msg">No saved addresses. Add one to get started!</div>
            )}

            {/* Address cards */}
            {addresses.map(addr => (
              <div key={addr.id} className={`addr-card ${addr.isDefault ? "addr-card-default" : ""}`}>
                <div className="addr-card-top">
                  <span className="addr-label-badge">{addr.label || "Home"}</span>
                  {addr.isDefault && <span className="addr-default-badge"><FaStar /> Default</span>}
                </div>
                <div className="addr-body">
                  <FaMapMarkerAlt className="addr-pin" />
                  <div>
                    {addr.phone && <div className="addr-phone">📞 {addr.phone}</div>}
                    <div className="addr-line">{addr.address}</div>
                    <div className="addr-line">{addr.city}, {addr.state} – {addr.zipCode}</div>
                  </div>
                </div>
                <div className="addr-actions">
                  {!addr.isDefault && (
                    <button className="addr-default-btn" onClick={() => handleSetDefault(addr.id)}>
                      Set as Default
                    </button>
                  )}
                  <button className="addr-edit-btn" onClick={() => openEditAddress(addr)}><FaEdit /></button>
                  <button className="addr-del-btn" onClick={() => handleDeleteAddress(addr.id)}><FaTrash /></button>
                </div>
              </div>
            ))}

            {/* Address Form */}
            {showAddressForm && (
              <div className="address-form addr-form-card">
                <h3>{editingAddressId ? "Edit Address" : "New Address"}</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Label</label>
                    <select value={addressForm.label} onChange={e => setAddressForm(p => ({ ...p, label: e.target.value }))}>
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" placeholder="Phone number" value={addressForm.phone} onChange={e => setAddressForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" placeholder="Street / Flat / Building" value={addressForm.address} onChange={e => setAddressForm(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" placeholder="City" value={addressForm.city} onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input type="text" placeholder="State" value={addressForm.state} onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Zip Code</label>
                    <input type="text" placeholder="Zip" value={addressForm.zipCode} onChange={e => setAddressForm(p => ({ ...p, zipCode: e.target.value }))} />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="save-btn" onClick={handleSaveAddress}>Save Address</button>
                  <button className="cancel-btn" onClick={() => setShowAddressForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Payment Methods Tab ── */}
        {activeTab === "payment" && (
          <div className="tab-content">
            <h2>Payment Methods</h2>

            {/* Wallet */}
            <div className="payment-section">
              <h3><FaWallet /> Wallet Balance</h3>
              <div className="wallet-balance" style={{ color: "white" }}>
                <div className="balance-display">
                  <span className="balance-amount">₹{(profileData.paymentMethods?.wallet || 0).toLocaleString("en-IN")}</span>
                  <span className="balance-label">Available Balance</span>
                </div>
                <div className="wallet-actions">
                  <button className="add-money-btn" onClick={handleAddWalletMoney}>Add ₹1,00,000</button>
                  <button className="view-history-btn" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.5)", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }} onClick={() => navigate("/wallet-history")}>View History</button>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="payment-section">
              <h3>Credit / Debit Cards</h3>
              <div className="cards-list">
                {profileData.paymentMethods?.cards?.map(card => (
                  <div key={card.id} className="card-item">
                    <div className="card-info">
                      <FaCreditCard className="card-icon" />
                      <div>
                        <p className="card-number">{card.cardNumber}</p>
                        <p className="card-holder">{card.cardHolder}</p>
                        <p className="card-expiry">{card.expiryDate}</p>
                      </div>
                    </div>
                    <button className="delete-btn" onClick={() => handleDeleteCard(card.id)}><FaTimes /></button>
                  </div>
                ))}
              </div>
              <div className="add-payment">
                <h4>Add New Card</h4>
                <div className="form-group"><input type="text" placeholder="Card Number" value={cardForm.cardNumber} onChange={e => setCardForm(p => ({ ...p, cardNumber: e.target.value }))} maxLength="16" /></div>
                <div className="form-group"><input type="text" placeholder="Card Holder Name" value={cardForm.cardHolder} onChange={e => setCardForm(p => ({ ...p, cardHolder: e.target.value }))} /></div>
                <div className="form-row">
                  <div className="form-group"><input type="text" placeholder="MM/YY" value={cardForm.expiryDate} onChange={e => setCardForm(p => ({ ...p, expiryDate: e.target.value }))} /></div>
                  <div className="form-group"><input type="text" placeholder="CVV" value={cardForm.cvv} onChange={e => setCardForm(p => ({ ...p, cvv: e.target.value }))} maxLength="4" /></div>
                </div>
                <button className="add-btn" onClick={handleAddCard}><FaPlus /> Add Card</button>
              </div>
            </div>

            {/* UPI */}
            <div className="payment-section">
              <h3>UPI Addresses</h3>
              <div className="upi-list">
                {profileData.paymentMethods?.upiAddresses?.map(upi => (
                  <div key={upi.id} className="upi-item">
                    <div className="upi-info"><FaWallet className="upi-icon" /><p>{upi.upiAddress}</p></div>
                    <button className="delete-btn" onClick={() => handleDeleteUPI(upi.id)}><FaTimes /></button>
                  </div>
                ))}
              </div>
              <div className="add-payment">
                <h4>Add New UPI Address</h4>
                <div className="form-group"><input type="text" placeholder="username@bankname" value={upiForm.upiAddress} onChange={e => setUpiForm({ upiAddress: e.target.value })} /></div>
                <button className="add-btn" onClick={handleAddUPI}><FaPlus /> Add UPI</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Wishlist Tab ── */}
        {activeTab === "wishlist" && (
          <div className="tab-content">
            <div className="section-header"><h2>My Wishlist</h2></div>
            {wishlistItems.length === 0 ? (
              <div className="no-items-msg">Your wishlist is empty. Browse products and tap the ❤️ to save!</div>
            ) : (
              <div className="pf-wishlist-grid">
                {wishlistItems.map(item => (
                  <div key={item.id} className="pf-wishlist-card" onClick={() => navigate(`/product/${item.id}`)}>
                    <img src={item.image} alt={item.name} className="pf-wl-img" />
                    <div className="pf-wl-info">
                      <div className="pf-wl-name">{item.name}</div>
                      <div className="pf-wl-price">₹{item.price?.toLocaleString("en-IN")}</div>
                    </div>
                    <button className="pf-wl-remove" title="Remove" onClick={e => { e.stopPropagation(); removeFromWishlist(item.id); }}>
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Recently Viewed Tab ── */}
        {activeTab === "recent" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Recently Viewed</h2>
              {recentItems.length > 0 && (
                <button className="add-addr-btn" style={{ background: "#ef4444" }} onClick={() => { localStorage.removeItem("shopper_recent"); setRecentItems([]); }}>Clear All</button>
              )}
            </div>
            {recentItems.length === 0 ? (
              <div className="no-items-msg">No recently viewed products yet. Start browsing!</div>
            ) : (
              <div className="pf-wishlist-grid">
                {recentItems.map(item => (
                  <div key={item.id} className="pf-wishlist-card" onClick={() => navigate(`/product/${item.id}`)}>
                    <img src={item.image} alt={item.name} className="pf-wl-img" />
                    <div className="pf-wl-info">
                      <div className="pf-wl-name">{item.name}</div>
                      <div className="pf-wl-price">₹{item.price?.toLocaleString("en-IN")}</div>
                      <div className="pf-wl-cat">{item.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AlertDialog
        isOpen={alertConfig.isOpen} onClose={hideAlert} onConfirm={alertConfig.onConfirm}
        title={alertConfig.title} message={alertConfig.message} type={alertConfig.type}
        confirmText={alertConfig.confirmText} cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
      />
    </div>
  );
};

export default Profile;
