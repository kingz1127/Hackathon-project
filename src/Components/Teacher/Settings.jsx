// src/pages/SettingsPage.jsx
import { useEffect, useState } from "react";
import "./Teacher.css";

export default function Settings({ teacher, setTeacher }) {
  const teacherId = teacher?.teacherId;
  const [darkMode, setDarkMode] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  


  // ✅ Fetch teacher info
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/admin/teachers/${teacherId}`
        );
        const data = await res.json();
        setFullName(data.fullName);
        setEmail(data.email);
      } catch (err) {
        console.error("Error fetching teacher:", err);
      }
    };
    if (teacherId) fetchTeacher();
  }, [teacherId]);

  // ✅ Save profile updates
  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/teachers/${teacherId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Change password
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      return setMessage("❌ Both old and new password required");
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(
        `http://localhost:5000/admin/teachers/${teacherId}/change-password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage("✅ Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
  localStorage.removeItem("teacherId");
  localStorage.removeItem("token");

  // Instead of setTeacher(null)
  window.location.href = "/login"; 
};


  return (
    <div className={`settings-container ${darkMode ? "dark" : ""}`}>
      <h2>⚙️ Teacher Settings</h2>

      {/* Account */}
      <section className="settings-section">
        <h3>Account Info</h3>
        <div className="settings-item">
          <label>Full Name:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="settings-item">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="save-btn" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </section>

      {/* Change Password */}
      <section className="settings-section">
        <h3>Change Password</h3>
        <div className="settings-item">
          <label>Old Password:</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div className="settings-item">
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <button
          className="save-btn"
          onClick={handleChangePassword}
          disabled={loading}
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </section>

      {/* Preferences */}
      <section className="settings-section">
        <h3>Preferences</h3>
        <div className="settings-item">
          <label>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            Enable Dark Mode
          </label>
        </div>
      </section>

      {/* Security */}
      <section className="settings-section danger-zone">
        <h3>Security</h3>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </section>

      {message && <p className="status-message">{message}</p>}
    </div>
  );
}
