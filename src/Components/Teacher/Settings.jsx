import { useEffect, useState } from "react";

export default function Settings({ teacher, setTeacher }) {
  const teacherId = teacher?.teacherId || localStorage.getItem("teacherId");
  
  
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
    <div className={"settings-container"}>

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