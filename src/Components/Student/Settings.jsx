import React, { useState } from "react";
import "./SettingsPage.css";
import { NavLink, useNavigate } from "react-router-dom";

function StudentSettings() {
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="settings-container">
      <h2 className="page-title">Account / Setting</h2>

      {/* Basic Information Section */}
      <div className="card">
        <h3 className="card-title">Basic Information</h3>
        <div className="profile-section">
          <div className="profile-pic-wrapper">
            <img
              src={image || "/default-avatar.png"} // put a default avatar in public/
              alt="Profile"
              className="profile-pic"
            />
            <label htmlFor="upload" className="upload-btn">
              Upload
            </label>
            <input
              type="file"
              id="upload"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          <div className="info-fields">
            <div className="form-group">
              <label>Name</label>
              <input type="text" defaultValue="John Doe" />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" defaultValue="johndoe@email.com" />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <input type="text" defaultValue="Male" />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" defaultValue="1998-09-11" />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input type="text" defaultValue="Accounting" />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input type="text" defaultValue="Lagos, Nigeria" />
            </div>
          </div>
        </div>
        <button className="update-btn">Update</button>
      </div>

      {/* Password and Security Section */}
      <div className="card">
        <h3 className="card-title">Password & Security</h3>
        <div className="info-fields">
          <div className="form-group">
            <label>Current Password 🔑</label>
            <input type="password" placeholder="Enter Current Password" />
          </div>
          <div className="form-group">
            <label>New Password 🔑</label>
            <input type="password" placeholder="Enter New Password" />
          </div>
          <div className="form-group">
            <label>Confirm New Password 🔑</label>
            <input type="password" placeholder="Confirm New Password" />
          </div>
        </div>
        <button className="update-btn">Update</button>
      </div>

      {/* Logout Section */}
      <div className="card logout-card">
         <button className="logout-btn" onClick={() => navigate("/login") }>Logout 🚪</button>
       
      </div>
    </div>
  );
}

export default StudentSettings;