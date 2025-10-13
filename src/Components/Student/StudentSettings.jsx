import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SettingsPage.css";

function StudentSettings() {
  const [image, setImage] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Basic info update states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();

  // Scroll to top when messages change
  useEffect(() => {
    if (error || success) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error, success]);

  // Fetch student data
  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem("token");
      const studentId = localStorage.getItem("studentId");

      console.log("🔍 Fetching student with ID:", studentId);

      if (!token || !studentId) {
        console.log("❌ No token or studentId found");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/students/profile/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch student data");
      }

      const data = await response.json();
      console.log("✅ Student data received:", data);
      setStudent(data);

      setFormData({
        fullName: data.fullName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        address: data.address || "",
      });

      if (data.studentImg) setImage(data.studentImg);

      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching student:", err);
      setError(`Failed to load student data: ${err.message}`);
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Update student info
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const studentId = localStorage.getItem("studentId");

      const formDataToSend = new FormData();
      formDataToSend.append("FullName", formData.fullName);
      formDataToSend.append("Email", formData.email);
      formDataToSend.append("PhoneNumber", formData.phoneNumber);
      formDataToSend.append("Address", formData.address);
      if (imageFile) formDataToSend.append("StudentIMG", imageFile);

      const response = await fetch(
        `http://localhost:5000/api/students/admin/students/${studentId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataToSend,
        }
      );

      if (!response.ok) throw new Error("Failed to update information");

      setSuccess("✅ Information updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchStudentData();
    } catch (err) {
      console.error("Error updating info:", err);
      setError("❌ Failed to update information");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Request code for password change
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || newPassword.length < 8)
      return setError("New password must be at least 8 characters");
    if (newPassword !== confirmPassword)
      return setError("New passwords do not match");

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem("token");
      const studentId = localStorage.getItem("studentId");

      const response = await fetch(
        "http://localhost:5000/api/students/password/request-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentId }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSentCode(true);
      setSuccess("📧 Verification code sent to your email!");
    } catch (err) {
      console.error("Error requesting code:", err);
      setError(err.message || "Failed to send verification code");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Verify code and change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!verificationCode)
      return setError("Please enter the verification code from your email");

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem("token");
      const studentId = localStorage.getItem("studentId");

      const response = await fetch(
        "http://localhost:5000/api/students/password/verify-and-change",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentId, verificationCode, newPassword }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSuccess("✅ Password changed successfully! Logging out...");
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("studentId");
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Error changing password:", err);
      setError(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setVerificationCode("");
      setSentCode(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("studentId");
    navigate("/login");
  };

  if (loading)
    return (
      <div className="settings-container">
        <div className="loading-text">Loading student data...</div>
      </div>
    );

  if (!student)
    return (
      <div className="settings-container">
        <div className="loading-text">
          <h3>Student not found</h3>
          <p style={{ color: "red" }}>{error}</p>
          <button onClick={() => navigate("/login")} className="update-btn">
            Back to Login
          </button>
        </div>
      </div>
    );

  return (
    <div className="settings-container">
      <h2 className="page-title">🎓 Student Account Settings</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Basic Info */}
      <div className="card">
        <h3 className="card-title">Basic Information</h3>
        <form onSubmit={handleUpdateInfo}>
          <div className="profile-section">
           <div className="profile-pic-wrapper">
  <img
    src={
      image
        ? image.startsWith("http")
          ? image
          : `http://localhost:5000/${image.replace(/\\/g, "/")}`
        : "/default-avatar.png"
    }
    alt="Profile"
    className="profile-pic"
  />
 
</div>


            <div className="info-fields">
              <div className="form-group">
                <label>Student ID</label>
                <input type="text" value={student.studentId || ""} disabled />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                   disabled
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                   disabled
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <input type="text" value={student.gender || ""} disabled />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="text" value={student.dob || ""} disabled />
              </div>
              <div className="form-group">
                <label>Course</label>
                <input type="text" value={student.course || ""} disabled />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                   disabled
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Password + Security */}
      <div className="card">
        <h3 className="card-title">Password & Security (2-Step Verification)</h3>

        {!sentCode ? (
          <form onSubmit={handleRequestCode}>
            <div className="info-fields">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value="********"
                  readOnly
                  style={{
                    WebkitTextSecurity: "disc",
                    letterSpacing: "3px",
                  }}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (min 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="update-btn"
              disabled={passwordLoading}
            >
              {passwordLoading ? "Sending Code..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div className="info-fields">
              <div className="form-group">
                <label>Verification Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  required
                />
                <small className="muted-text">
                  Check your email ({student.email}) for the code.
                </small>
              </div>
            </div>
            <div className="btn-group">
              <button
                type="submit"
                className="update-btn"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Verifying..." : "Verify & Change Password"}
              </button>
              <button
                type="button"
                className="update-btn cancel"
                onClick={() => {
                  setSentCode(false);
                  setVerificationCode("");
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Logout */}
      <div className="card logout-card">
        <button className="logout-btn" onClick={handleLogout}>
          Logout 🚪
        </button>
      </div>
    </div>
  );
}

export default StudentSettings;
