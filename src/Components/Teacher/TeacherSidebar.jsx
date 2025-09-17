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
        <NavLink to="/teachdashboard" className="nav-link">
          <FaTachometerAlt /> Dashboard
        </NavLink>
        <NavLink to="/teachprofile" className="nav-link">
            <FaUsers /> Profile
            </NavLink>
         <NavLink to="/teachclasses" className="nav-link">
          <FaBook /> My Classes
        </NavLink>
         <NavLink to="/teachattendance" className="nav-link">
          <FaClipboardCheck /> Attendance
        </NavLink>
            <NavLink to="/teachstudent" className="nav-link">
            <FaUsers /> Students
            </NavLink>
        <NavLink to="/teachannouncements" className="nav-link">
          <FaEnvelope /> Announcements
        </NavLink>
         <NavLink to="/teachresources" className="nav-link">
          <FaBook /> Resources
        </NavLink>
         <NavLink to="/teachsettings" className="nav-link">
          <FaCog /> Settings
        </NavLink>
    </div>
  );
}
