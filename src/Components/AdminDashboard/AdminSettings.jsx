// import React, { useState } from "react";
// import axios from "axios";
// import { Twitter, Facebook, Linkedin } from "lucide-react";
// import "./adminSettings.css";

// function AdminSettings() {
//   const [activeTab, setActiveTab] = useState("overview");
//   const [fullName, setFullName] = useState("");
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [role, setRole] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [profileImage, setProfileImage] = useState(null);
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [reenterPassword, setReenterPassword] = useState("");

//   // Backend API base URL
//   const API_BASE_URL = "http://localhost:5000/api/admin"; // Change if hosted

//   // Create Admin Profile
//   const handleRegister = async (e) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       alert("Passwords do not match.");
//       return;
//     }

//     try {
//       const response = await axios.post(`${API_BASE_URL}/register`, {
//         fullName,
//         username,
//         email,
//         role,
//         password,
//         confirmPassword,
//         avatar: profileImage,
//       });

//       alert("Admin profile created successfully!");
//       console.log(response.data);
//     } catch (error) {
//       console.error("Error creating profile:", error.response?.data || error.message);
//       alert(error.response?.data?.message || "Error creating profile.");
//     }
//   };

//   // Edit Profile
//   const handleEditProfile = async (e) => {
//     e.preventDefault();
//     const token = localStorage.getItem("adminToken");

//     try {
//       const response = await axios.put(
//         `${API_BASE_URL}/profile`,
//         { fullName, username, email, role, avatar: profileImage },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       alert("Profile updated successfully!");
//       console.log(response.data);
//     } catch (error) {
//       console.error("Error updating profile:", error.response?.data || error.message);
//       alert(error.response?.data?.message || "Error updating profile.");
//     }
//   };

//   // Change Password
//   const handleChangePassword = async (e) => {
//     e.preventDefault();
//     const token = localStorage.getItem("adminToken");

//     if (newPassword !== reenterPassword) {
//       alert("New passwords do not match.");
//       return;
//     }

//     try {
//       const response = await axios.put(
//         `${API_BASE_URL}/change-password`,
//         {
//           currentPassword,
//           newPassword,
//           confirmNewPassword: reenterPassword,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       alert("Password changed successfully!");
//       console.log(response.data);
//     } catch (error) {
//       console.error("Error changing password:", error.response?.data || error.message);
//       alert(error.response?.data?.message || "Error changing password.");
//     }
//   };

//   // Handle Profile Picture Upload
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setProfileImage(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };
//   return (
//     <div className="profile-container">
//       <div className="profile-sidebar">
//         <img src={profileImage} alt="Profile" className="profile-image" />
//         <h1>{fullName}</h1>
//         <h3>{role}</h3>
//       </div>
//       <div className="profile-content">
//         <div className="tabs">
//           <button
//             className={`tab ${activeTab === "overview" ? "active" : ""}`}
//             onClick={() => setActiveTab("overview")}
//           >
//             Overview
//           </button>
//           <button
//             className={`tab ${activeTab === "Login" ? "active" : ""}`}
//             onClick={() => setActiveTab("Login")}
//           >
//             Login
//           </button>
//           <button
//             className={`tab ${activeTab === "edit-profile" ? "active" : ""}`}
//             onClick={() => setActiveTab("edit-profile")}
//           >
//             Edit Profile
//           </button>
//           <button
//             className={`tab ${activeTab === "change-password" ? "active" : ""}`}
//             onClick={() => setActiveTab("change-password")}
//           >
//             Change Password
//           </button>
//         </div>
//         <div
//           className={`content-section ${
//             activeTab === "overview" ? "active" : ""
//           }`}
//         >
//           <h2>Overview</h2>
//           <h2>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellat, odio!</h2>
//           <p>
//            {role}
//           </p>
//         </div>
//         <div
//           className={`content-section ${
//             activeTab === "Login" ? "active" : ""
//           }`}
//         >
//           <div className="edit-profile-form">
//             <h2>Login</h2>
//             <form onSubmit={handleRegister}>
//               <div className="detail-row">
//                 <label>Profile Image</label>
//                 {profileImage && (
//                   <img
//                     src={profileImage}
//                     alt="Profile Preview"
//                     className="profile-preview"
//                   />
//                 )}

//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                   className="file-input"
//                   required
//                 />
                
//               </div>
//               <div className="detail-row">
//                 <label>FullName</label>
//                 <input
//                   type="text"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   placeholder="Enter full name"
//                   required
//                 />
//               </div>
//               <div className="detail-row">
//                 <label>Username</label>
//                 <input
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   placeholder="Enter username"
//                   required
//                 />
//               </div>
//               <div className="detail-row">
//                 <label>Email</label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email"
//                   required
//                 />
//               </div>
//               <div className="detail-row">
//                 <label>Role</label>
//                 <input
//                   type="text"
//                   value={role}
//                   onChange={(e) => setRole(e.target.value)}
//                   placeholder="Enter role"
//                   required
//                 />
//               </div>
//               <div className="detail-row">
//                 <label>Password</label>
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter password"
//                   required
//                 />
//               </div>
//               <div className="detail-row">
//                 <label>Confirm Password</label>
//                 <input
//                   type="password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   placeholder="Confirm password"
//                   required
//                 />
//               </div>
//               <button type="submit" className="blue-button">
//                 Create Profile
//               </button>
//             </form>
//           </div>
//         </div>

//         <div
//           className={`content-section ${
//             activeTab === "edit-profile" ? "active" : ""
//           }`}
//         >
//           <div className="edit-profile-form">
//             <h2>Edit Profile</h2>
//             <form onSubmit={handleEditProfile}>
//               <div className="detail-row">
//                 <label>Profile Image</label>
//                 {profileImage && (
//                   <img
//                     src={profileImage}
//                     alt="Profile Preview"
//                     className="profile-preview"
//                   />
//                 )}

//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                   className="file-input"
//                   required
//                 />
                
//               </div>
//               <div className="detail-row">
//                 <label>FullName</label>
//                 <input
//                   type="text"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   placeholder="Enter your fullname"
//                   required
//                 />
//               </div>
//               <div className="detail-row">
//                 <label>Username</label>
//                 <input
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   placeholder="Enter your username"
//                   required
//                 />
//               </div>
//               <div className="detail-row">
//                 <label>Email</label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email"
//                   required
//                 />
//               </div>
//               <div className="detail-row">
//                 <label>Role</label>
//                 <input
//                   type="text"
//                   value={role}
//                   onChange={(e) => setRole(e.target.value)}
//                   placeholder="Enter your role"
//                   required
//                 />
//               </div>
//               <button type="submit" className="blue-button">
//                 Save Changes
//               </button>
//             </form>
//           </div>
//         </div>
//         <div
//           className={`content-section ${
//             activeTab === "change-password" ? "active" : ""
//           }`}
//         >
//           <h2>Change Password</h2>
//           <form onSubmit={handleChangePassword}>
//             <div className="detail-row">
//               <label>Current Password</label>
//               <input
//                 type="password"
//                 value={currentPassword}
//                 onChange={(e) => setCurrentPassword(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="detail-row">
//               <label>New Password</label>
//               <input
//                 type="password"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="detail-row">
//               <label>Re-enter New Password</label>
//               <input
//                 type="password"
//                 value={reenterPassword}
//                 onChange={(e) => setReenterPassword(e.target.value)}
//                 required
//               />
//             </div>
//             <button type="submit" className="blue-button">
//               Change Password
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminSettings;


import { useEffect, useState } from "react";
import "../AdminDashboard/adminSettings.css";

export default function AdminSettings({ admin, setAdmin }) {
  const adminId = admin?.id || localStorage.getItem("adminId");
  
  // Initialize with empty strings to avoid controlled/uncontrolled warnings
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  // Fetch admin info
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch(`http://localhost:5000/admin/profile/${adminId}`);
        const data = await res.json();
        
        // Set with fallback to empty string
        setUsername(data.username || "");
        setEmail(data.email || "");
      } catch (err) {
        console.error("Error fetching admin:", err);
      }
    };
    if (adminId) fetchAdmin();
  }, [adminId]);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  // Update profile information
  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      return showMessage("❌ Username is required", "error");
    }

    setProfileLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/admin/profile/${adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update local state and localStorage
      setAdmin(data.admin);
      localStorage.setItem("adminName", data.admin.username);
      
      showMessage("✅ Profile updated successfully", "success");
    } catch (err) {
      showMessage(`❌ ${err.message}`, "error");
    } finally {
      setProfileLoading(false);
    }
  };

  // Step 1: Request password change (validates old password, sends email)
  const handleRequestPasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return showMessage("❌ Please fill all password fields.", "error");
    }
    if (newPassword !== confirmPassword) {
      return showMessage("❌ New passwords do not match.", "error");
    }
    if (newPassword.length < 8) {
      return showMessage("❌ New password must be at least 8 characters.", "error");
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/admin/${adminId}/request-password-change`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setAwaitingVerification(true);
      showMessage(`✅ ${data.message} Check your inbox at ${data.email}`, "success");
    } catch (err) {
      showMessage(`❌ ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code and finalize password change
  const handleVerifyPasswordChange = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      return showMessage("❌ Please enter the 6-digit verification code.", "error");
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/admin/${adminId}/verify-password-change`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: verificationCode }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showMessage("✅ Password changed successfully! Logging you out in 3 seconds...", "success");
      
      // Reset all fields
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setVerificationCode("");
      setAwaitingVerification(false);
      
      // Auto-logout after 3 seconds
      setTimeout(() => {
        handleLogout();
      }, 3000);
    } catch (err) {
      showMessage(`❌ ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelVerification = () => {
    setAwaitingVerification(false);
    setVerificationCode("");
    showMessage("Password change cancelled", "error");
  };

  const handleLogout = () => {
    localStorage.removeItem("adminId");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("adminName");
    window.location.href = "/login";
  };

  return (
    <div className={"settings-containers"}>

      <h2>⚙️ Admin Settings</h2>

      {/* Status Message */}
      {message && (
        <div className={`status-message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Account Info */}
      <section className="settings-section">
        <h3>Account Info</h3>
        <div className="settings-item">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>
        <div className="settings-item">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
          />
        </div>
        <button
          className="save-btn"
          onClick={handleUpdateProfile}
          disabled={profileLoading}
        >
          {profileLoading ? "Updating..." : "Update Profile"}
        </button>
      </section>

      {/* Password Change Section */}
      <section className="settings-section password-section">
        <h3>🔒 Change Password</h3>

        {!awaitingVerification ? (
          <>
            <div className="settings-item">
              <label>Current Password:</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="settings-item">
              <label>New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
              />
            </div>
            <div className="settings-item">
              <label>Confirm New Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
            <button
              className="save-btn"
              onClick={handleRequestPasswordChange}
              disabled={loading}
            >
              {loading ? "Sending Code..." : "Request Password Change"}
            </button>
            <p className="help-text">
              ℹ️ You'll receive a verification code via email
            </p>
          </>
        ) : (
          <>
            <div className="verification-notice">
              <p>📧 A 6-digit verification code has been sent to your email.</p>
              <p>Please check your inbox and enter the code below.</p>
            </div>
            <div className="settings-item">
              <label>Verification Code:</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                style={{ fontSize: "1.8rem", letterSpacing: "8px", textAlign: "center" }}
              />
            </div>
            <div className="button-group">
              <button
                className="save-btn"
                onClick={handleVerifyPasswordChange}
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? "Verifying..." : "Confirm Password Change"}
              </button>
              <button
                className="cancel-btn"
                onClick={handleCancelVerification}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
            <p className="help-text">
              ⏰ Code expires in 10 minutes
            </p>
          </>
        )}
      </section>

      {/* System Information */}
      <section className="settings-section">
        <h3>System Information</h3>
        <div className="system-info">
          <div className="info-item">
            <label>Role:</label>
            <span>Administrator</span>
          </div>
          <div className="info-item">
            <label>Account Created:</label>
            <span>{admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </section>

      {/* Logout */}
      <section className="settings-section danger-zone">
        <h3>Security</h3>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </section>
    </div>
  );
}