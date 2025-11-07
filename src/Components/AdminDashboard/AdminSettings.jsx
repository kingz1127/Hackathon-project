import React, { useState } from "react";
import axios from "axios";
import { Twitter, Facebook, Linkedin } from "lucide-react";
import "./adminSettings.css";

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("overview");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");

  // Backend API base URL
  const API_BASE_URL = "http://localhost:5000/api/admin"; // Change if hosted

  // Create Admin Profile
  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        fullName,
        username,
        email,
        role,
        password,
        confirmPassword,
        avatar: profileImage,
      });

      alert("Admin profile created successfully!");
      console.log(response.data);
    } catch (error) {
      console.error("Error creating profile:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error creating profile.");
    }
  };

  // Edit Profile
  const handleEditProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");

    try {
      const response = await axios.put(
        `${API_BASE_URL}/profile`,
        { fullName, username, email, role, avatar: profileImage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Profile updated successfully!");
      console.log(response.data);
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error updating profile.");
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");

    if (newPassword !== reenterPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/change-password`,
        {
          currentPassword,
          newPassword,
          confirmNewPassword: reenterPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Password changed successfully!");
      console.log(response.data);
    } catch (error) {
      console.error("Error changing password:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error changing password.");
    }
  };

  // Handle Profile Picture Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <img src={profileImage} alt="Profile" className="profile-image" />
        <h1>{fullName}</h1>
        <h3>{role}</h3>
      </div>
      <div className="profile-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === "Login" ? "active" : ""}`}
            onClick={() => setActiveTab("Login")}
          >
            Login
          </button>
          <button
            className={`tab ${activeTab === "edit-profile" ? "active" : ""}`}
            onClick={() => setActiveTab("edit-profile")}
          >
            Edit Profile
          </button>
          <button
            className={`tab ${activeTab === "change-password" ? "active" : ""}`}
            onClick={() => setActiveTab("change-password")}
          >
            Change Password
          </button>
        </div>
        <div
          className={`content-section ${
            activeTab === "overview" ? "active" : ""
          }`}
        >
          <h2>Overview</h2>
          <h2>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellat, odio!</h2>
          <p>
           {role}
          </p>
        </div>
        <div
          className={`content-section ${
            activeTab === "Login" ? "active" : ""
          }`}
        >
          <div className="edit-profile-form">
            <h2>Login</h2>
            <form onSubmit={handleRegister}>
              <div className="detail-row">
                <label>Profile Image</label>
                {profileImage && (
                  <img
                    src={profileImage}
                    alt="Profile Preview"
                    className="profile-preview"
                  />
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                  required
                />
                
              </div>
              <div className="detail-row">
                <label>FullName</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="detail-row">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="detail-row">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="detail-row">
                <label>Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Enter role"
                  required
                />
              </div>
              <div className="detail-row">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="detail-row">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </div>
              <button type="submit" className="blue-button">
                Create Profile
              </button>
            </form>
          </div>
        </div>

        <div
          className={`content-section ${
            activeTab === "edit-profile" ? "active" : ""
          }`}
        >
          <div className="edit-profile-form">
            <h2>Edit Profile</h2>
            <form onSubmit={handleEditProfile}>
              <div className="detail-row">
                <label>Profile Image</label>
                {profileImage && (
                  <img
                    src={profileImage}
                    alt="Profile Preview"
                    className="profile-preview"
                  />
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                  required
                />
                
              </div>
              <div className="detail-row">
                <label>FullName</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your fullname"
                  required
                />
              </div>
              <div className="detail-row">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="detail-row">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="detail-row">
                <label>Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Enter your role"
                  required
                />
              </div>
              <button type="submit" className="blue-button">
                Save Changes
              </button>
            </form>
          </div>
        </div>
        <div
          className={`content-section ${
            activeTab === "change-password" ? "active" : ""
          }`}
        >
          <h2>Change Password</h2>
          <form onSubmit={handleChangePassword}>
            <div className="detail-row">
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="detail-row">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="detail-row">
              <label>Re-enter New Password</label>
              <input
                type="password"
                value={reenterPassword}
                onChange={(e) => setReenterPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="blue-button">
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
