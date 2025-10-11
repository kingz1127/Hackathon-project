import { useEffect, useState } from "react";

export default function Settings({ teacher, setTeacher }) {
  const teacherId = teacher?.teacherId || localStorage.getItem("teacherId");
  const [darkMode, setDarkMode] = useState(false);
  
  // Initialize with empty strings to avoid controlled/uncontrolled warnings
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  // Fetch teacher info
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`http://localhost:5000/admin/teachers/${teacherId}`);
        const data = await res.json();
        
        // Set with fallback to empty string
        setFullName(data.FullName || "");
        setEmail(data.Email || "");
      } catch (err) {
        console.error("Error fetching teacher:", err);
      }
    };
    if (teacherId) fetchTeacher();
  }, [teacherId]);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  // Save profile updates
  // const handleSave = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch(`http://localhost:5000/admin/update-teacher/${teacherId}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ FullName: fullName, Email: email }),
  //     });
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.message);
  //     showMessage("✅ Profile updated successfully!", "success");
  //   } catch (err) {
  //     showMessage(`❌ ${err.message}`, "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
        `http://localhost:5000/teacher/${teacherId}/request-password-change`,
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
        `http://localhost:5000/teacher/${teacherId}/verify-password-change`,
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
    localStorage.removeItem("teacherId");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("teacherName");
    window.location.href = "/login";
  };

  return (
    <div className={`settings-container ${darkMode ? "dark" : ""}`}>
      {/* <style>{`
        .settings-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .settings-section {
          background: white;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .settings-item {
          margin-bottom: 15px;
        }
        .settings-item label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
        }
        .settings-item input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .save-btn, .cancel-btn, .logout-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }
        .save-btn {
          background: #4CAF50;
          color: white;
        }
        .save-btn:hover:not(:disabled) {
          background: #45a049;
        }
        .cancel-btn {
          background: #f44336;
          color: white;
        }
        .cancel-btn:hover:not(:disabled) {
          background: #da190b;
        }
        .logout-btn {
          background: #ff5722;
          color: white;
        }
        .logout-btn:hover {
          background: #e64a19;
        }
        .save-btn:disabled, .cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .status-message {
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .status-message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .status-message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        .verification-notice {
          background: #fff3cd;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 15px;
          border: 1px solid #ffeaa7;
        }
        .verification-notice p {
          margin: 5px 0;
          color: #856404;
        }
        .help-text {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        .password-section {
          border-left: 4px solid #ff9800;
        }
        .danger-zone {
          border-left: 4px solid #f44336;
        }
        .button-group {
          display: flex;
          gap: 10px;
        }
      `}</style> */}

      <h2>⚙️ Teacher Settings</h2>

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
          <label>Full Name:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled
          />
        </div>
        <div className="settings-item">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled 
          />
        </div>
       
      </section>

      {/* Password Change Section */}
      <section className="settings-section password-section">
        <h3>🔒 Change Password</h3>

        {!awaitingVerification ? (
          <>
            <div className="settings-item">
              <label>Old Password:</label>
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
            {" "}Enable Dark Mode
          </label>
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