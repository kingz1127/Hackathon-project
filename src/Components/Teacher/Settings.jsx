import { useState } from "react";
import "./Teacher.css";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      <section className="settings-section">
        <h3>Account</h3>
        <div className="settings-item">
          <label>Email:</label>
          <input type="email" placeholder="Update email" />
        </div>
        <div className="settings-item">
          <label>Password:</label>
          <input type="password" placeholder="Change password" />
        </div>
      </section>

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

      <section className="settings-section">
        <h3>Security</h3>
        <button className="logout-btn">Logout</button>
      </section>
    </div>
  );
}
