import React from "react";
import "./Sidebar.css";

const sidebarItems = [
  { name: "Dashboard", icon: "🏠" },
  { name: "Courses", icon: "📚" },
  { name: "Assignments", icon: "📝" },
  { name: "Schedule", icon: "📅" },
  { name: "Grades", icon: "📊" },
  { name: "Attendance", icon: "✅" },
  { name: "Resources", icon: "📥" },
  { name: "Settings", icon: "⚙️" },
];

export default function Sidebar({ active, setActive }) {
  return (
    <div className="sidebar">
      <h2 className="logo">Learner</h2>
      <ul>
        {sidebarItems.map((item) => (
          <li key={item.name}>
            <button
              className={`sidebar-btn${active === item.name ? " active" : ""}`}
              onClick={() => setActive(item.name)}
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                width: "7rem",
                background: "none",
                border: "none",
                color: "inherit",
                textAlign: "left",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignSelf: "left",
                marginLeft: "-4rem",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "1.8rem" }}>{item.icon}</span>
              {item.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}