// src/components/Sidebar.jsx
import { FaBook, FaClipboardCheck, FaCog, FaEnvelope, FaTachometerAlt, FaUsers } from "react-icons/fa";
import { NavLink } from "react-router";
import "./Teacher.css";
export default function TeacherSidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <a href="/">Learner</a>
      </div>

      <div className="profile">
        <div className="profile-img">CR</div>
        <div className="profile-name">MR. Christopher</div>
        <div className="profile-role">React/Spring Boot Teacher</div>
      </div>
        <NavLink to="/dashboard" className="nav-link">
          <FaTachometerAlt /> Dashboard
        </NavLink>
        <NavLink to="/profile" className="nav-link">
            <FaUsers /> Profile
            </NavLink>
         <NavLink to="/classes" className="nav-link">
          <FaBook /> My Classes
        </NavLink>
         <NavLink to="/attendance" className="nav-link">
          <FaClipboardCheck /> Attendance
        </NavLink>
            <NavLink to="/student" className="nav-link">
            <FaUsers /> Students
            </NavLink>
        <NavLink to="/announcements" className="nav-link">
          <FaEnvelope /> Announcements
        </NavLink>
         <NavLink to="/resources" className="nav-link">
          <FaBook /> Resources
        </NavLink>
         <NavLink to="/settings" className="nav-link">
          <FaCog /> Settings
        </NavLink>
    </div>
  );
}
